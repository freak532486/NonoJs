import { htmlToElement } from "../../common/services/html-to-element.js";
import { CellKnowledge } from "../../common/types/nonogram-types.js";
import catalog from "./catalog.html"
import catalogEntry from "./catalog-entry.html"
import "./catalog.css"
import { SavefileUtils } from "../../common/services/savefile/savefile-utils.js";
import UIComponent from "../../common/types/ui-component.js";
import { CatalogAccess } from "../../common/services/catalog/catalog-access.js";
import SavefileAccess from "../../common/services/savefile/savefile-access.js";

export class Catalog implements UIComponent {

    #view?: HTMLElement;
    #entryTemplate?: HTMLElement;

    #onNonogramSelected: (nonogramId: string) => void = () => {};

    /**
     * @param {CatalogAccess} catalogAccess
     * @param {SavefileAccess} savefileAccess
     */
    constructor (
        private readonly catalogAccess: CatalogAccess,
        private readonly savefileAccess: SavefileAccess
    )
    {}

    /**
     * Creates the catalog and attaches it to the parent.
     */
    async create(parent: HTMLElement): Promise<HTMLElement> {
        if (!this.#view) {
            this.#view = htmlToElement(catalog);
        }
        
        parent.appendChild(this.#view);
        this.refresh();
        return this.#view;
    }

    cleanup() {
        // Nothing to do
    }

    /**
     * Reloads all nonograms and updates progress.
     */
    async refresh() {
        const entriesRoot = this.view.querySelector(".entries") as HTMLElement;
        entriesRoot.replaceChildren();

        const loaded = await this.catalogAccess.getAllNonograms();
        loaded.sort((a, b) => {
            if (a.colHints.length > b.colHints.length) {
                return 1;
            } else if (a.colHints.length < b.colHints.length) {
                return -1;
            } else {
                return a.rowHints.length - b.rowHints.length;
            }
        });
        
        const savefile = await this.savefileAccess.getSavefile();
        const stored = SavefileUtils.getAllStoredStates(savefile);
        for (const nonogram of loaded) {
            const savestate = stored.get(nonogram.id);
            const cells = savestate == undefined ? undefined :
                SavefileUtils.calculateActiveState(nonogram.colHints.length, nonogram.rowHints.length, savestate.history);
            const numFilled = cells
                ?.reduce((sum, x) => sum + (x == CellKnowledge.UNKNOWN ? 0 : 1), 0) 
                ?? 0;
                
            const numTotal = nonogram.rowHints.length * nonogram.colHints.length;
            const div = this.#createEntry(
                "#" + nonogram.id,
                nonogram.colHints.length + "x" + nonogram.rowHints.length,
                numFilled / numTotal
            );

            div.onclick = () => this.#onNonogramSelected(nonogram.id);
            entriesRoot.appendChild(div);
            
        }
    }

    get view() {
        if (!this.#view) {
            throw new Error("init() was not called.");
        }

        return this.#view;
    }

    /**
     * Sets the callback for when a nonogram is selected.
     */
    set onNonogramSelected(fn: (nonogramId: string) => void) {
        this.#onNonogramSelected = fn;
    }

    /**
     * Creates a catalog entry with the given content.
     */
    #createEntry(id: string, size: string, progress: number): HTMLElement {
        if (!this.#entryTemplate) {
            this.#entryTemplate = htmlToElement(catalogEntry);
        }

        const div = this.#entryTemplate.cloneNode(true) as HTMLElement;
        div.querySelector(".catalog-entry .name")!.textContent = id.substring(0, 6);
        div.querySelector(".catalog-entry .size")!.textContent = size;
        div.querySelector(".catalog-entry .progress")!.textContent = "Progress: " + Math.floor(progress * 100) + "%";
        return div;
    }
}