import template from "./template.html"
import "./style.css"
import { CatalogAccess } from "../../../common/services/catalog/catalog-access";
import SavefileAccess from "../../../common/services/savefile/savefile-access";
import UIComponent from "../../../common/types/ui-component";
import { htmlToElement } from "../../../common/services/html-to-element";
import { getSavestateForNonogram } from "../../../common/services/savefile/savefile-utils";
import { NonogramState } from "../../../common/types/nonogram-types";
import NonogramButton from "../nonogram-button/nonogram-button.component";

export default class ContinuePlaying implements UIComponent
{

    public readonly view: HTMLElement;

    constructor(
        private readonly catalogAccess: CatalogAccess,
        private readonly savefileAccess: SavefileAccess,
        private readonly lastPlayedNonogramId: string,
        private readonly onNonogramSelected: () => void
    )
    {
        this.view = htmlToElement(template);
    }

    async create(parent: HTMLElement): Promise<HTMLElement> {
        const loadedNonogram = await this.catalogAccess.getNonogram(this.lastPlayedNonogramId);
        if (loadedNonogram == undefined) {
            throw new Error("Nonogram with ID " + this.lastPlayedNonogramId + " doesn't exist.");
        }

        const savefile = await this.savefileAccess.fetchLocalSavefile();
        const savestate = getSavestateForNonogram(savefile, this.lastPlayedNonogramId);

        const state = savestate ? 
            new NonogramState(loadedNonogram.rowHints, loadedNonogram.colHints, savestate.cells) :
            NonogramState.empty(loadedNonogram.rowHints, loadedNonogram.colHints);

        const button = NonogramButton.withMaximumSize(state, 200, 200, this.onNonogramSelected);
        button.create(this.view);

        parent.appendChild(this.view);
        return this.view;
    }

    cleanup(): void {
        // Nothing to do
    }
    
}