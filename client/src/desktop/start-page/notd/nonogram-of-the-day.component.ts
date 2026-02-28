import template from "./template.html"
import "./style.css"
import UIComponent from "../../../common/types/ui-component"
import { htmlToElement } from "../../../common/services/html-to-element";
import { StartPageNonogramSelector } from "../../../common/services/start-page/start-page-nonogram-selector";
import { CatalogAccess } from "../../../common/services/catalog/catalog-access";
import { NonogramState } from "../../../common/types/nonogram-types";
import NonogramDesktopPreview from "../nonogram-preview/nonogram-desktop-preview.component"

export default class NonogramsOfTheDay implements UIComponent
{

    readonly view: HTMLElement;
    #buttons: Array<HTMLButtonElement> = [];

    #previews: Array<NonogramDesktopPreview> = [];
    #nonogramIds: Array<string> = [];

    constructor(
        private readonly catalog: CatalogAccess,
        private readonly selector: StartPageNonogramSelector,
        private readonly onNonogramSelected: (nonogramId: string) => void
    )
    {
        this.view = htmlToElement(template);

        const nav = this.view.querySelector(".nav") as HTMLElement;
        for (const child of Array.from(nav.children)) {
            this.#buttons.push(child as HTMLButtonElement);
        }

        for (let i = 0; i < this.#buttons.length; i++) {
            this.#buttons[i].onclick = () => this.#selectNonogram(i);
        }
    }

    async create(parent: HTMLElement): Promise<HTMLElement> {
        parent.appendChild(this.view);
        const notdDisplay = this.view.querySelector(".display") as HTMLElement;

        /* Create nonogram previews */
        const notdIds = await this.selector.getNonogramIdsOfTheDay();
        for (let i = 0; i < notdIds.length; i++) {
            const nonogramId = notdIds[i];
            const nonogram = await this.catalog.getNonogram(nonogramId);
            if (nonogram == undefined) {
                continue;
            }

            const preview = new NonogramDesktopPreview(NonogramState.empty(nonogram.rowHints, nonogram.colHints));
            preview.create(notdDisplay);
            preview.view.onclick = () => this.onNonogramSelected(nonogramId);
            this.#previews.push(preview);
            this.#nonogramIds.push(nonogramId);
            window.addEventListener("resize", () => fitPreviewIntoParent(notdDisplay, preview));
            preview.view.style.display = "none";
        }

        /* Select small nonogram by default */
        this.#selectNonogram(0);

        return this.view;
    }

    #selectNonogram(idx: number)
    {
        const notdDisplay = this.view.querySelector(".display") as HTMLElement;

        /* Change button styles */
        for (const button of this.#buttons) {
            button.classList.remove("selected");
        }
        this.#buttons[idx].classList.add("selected");

        /* Hide all previews */
        for (const preview of this.#previews) {
            preview.view.style.display = "none";
        }

        /* Show selected preview */
        this.#previews[idx].view.style.display = "block";
        fitPreviewIntoParent(notdDisplay, this.#previews[idx]);
    }

    cleanup(): void {
        // Nothing to do
    }
    
}

/**
 * Fits the given nonogram preview into its parent. 
 */
function fitPreviewIntoParent(parent: HTMLElement, preview: NonogramDesktopPreview)
{
    const parentStyle = window.getComputedStyle(parent);

    const pw = parseFloat(parentStyle.getPropertyValue("width"));
    const ph = parseFloat(parentStyle.getPropertyValue("height"));

    const hScale = Math.min(1, pw / preview.view.clientWidth);
    const vScale = Math.min(1, ph / preview.view.clientHeight);
    const scale = Math.min(hScale, vScale);

    preview.view.style.transform = `scale(${scale})`;
}