import template from "./template.html"
import "./style.css"
import { CatalogAccess } from "../../../common/services/catalog/catalog-access";
import SavefileAccess from "../../../common/services/savefile/savefile-access";
import UIComponent from "../../../common/types/ui-component";
import { htmlToElement } from "../../../common/services/html-to-element";
import { getSavestateForNonogram } from "../../../common/services/savefile/savefile-utils";
import { NonogramState } from "../../../common/types/nonogram-types";
import NonogramButton from "../nonogram-button/nonogram-button.component";
import { SaveFile } from "nonojs-common";

export default class ContinuePlaying implements UIComponent
{

    public readonly view: HTMLElement;

    constructor(
        private readonly catalogAccess: CatalogAccess,
        private readonly savefileAccess: SavefileAccess,
        private readonly onNonogramSelected: (nonogramId: string) => void
    )
    {
        this.view = htmlToElement(template);
    }

    async create(parent: HTMLElement): Promise<HTMLElement> {
        const savefile = await this.savefileAccess.fetchLocalSavefile();

        for (const nonogramId of savefile.activeNonogramIds) {
            await this.createButton(savefile, nonogramId);
        }

        parent.appendChild(this.view);
        return this.view;
    }

    private async createButton(savefile: SaveFile, nonogramId: string)
    {
        const container = this.view.querySelector(".container") as HTMLElement;
        const loadedNonogram = await this.catalogAccess.getNonogram(nonogramId);
        if (loadedNonogram == undefined) {
            return;
        }

        const savestate = getSavestateForNonogram(savefile, nonogramId);
        const state = savestate ? 
            new NonogramState(loadedNonogram.rowHints, loadedNonogram.colHints, savestate.cells) :
            NonogramState.empty(loadedNonogram.rowHints, loadedNonogram.colHints);

        const button = NonogramButton.withMaximumSize(state, 200, 200, () => this.onNonogramSelected(nonogramId));
        button.create(container);
    }

    cleanup(): void {
        // Nothing to do
    }
    
}