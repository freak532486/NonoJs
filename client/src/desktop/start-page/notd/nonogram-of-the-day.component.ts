import template from "./template.html"
import "./style.css"
import UIComponent from "../../../common/types/ui-component"
import { htmlToElement } from "../../../common/services/html-to-element";
import { StartPageNonogramSelector } from "../../../common/services/start-page/start-page-nonogram-selector";
import { CatalogAccess } from "../../../common/services/catalog/catalog-access";
import { NonogramState } from "../../../common/types/nonogram-types";
import NonogramButton from "../nonogram-button/nonogram-button.component"
import NonogramThumbnail from "../../../common/components/nonogram-thumbnail/nonogram-thumbnail.component";
import SavefileAccess from "../../../common/services/savefile/savefile-access";
import { getSavestateForNonogram } from "../../../common/services/savefile/savefile-utils";

export default class NonogramsOfTheDay implements UIComponent
{

    public readonly view: HTMLElement;

    constructor(
        private readonly catalog: CatalogAccess,
        private readonly savefileAccess: SavefileAccess,
        private readonly selector: StartPageNonogramSelector,
        private readonly onNonogramSelected: (nonogramId: string) => void
    )
    {
        this.view = htmlToElement(template);
    }

    async create(parent: HTMLElement): Promise<HTMLElement> {
        const savefile = await this.savefileAccess.fetchLocalSavefile();
        parent.appendChild(this.view);

        /* Create nonogram buttons */
        const notdIds = await this.selector.getNonogramIdsOfTheDay();
        for (const nonogramId of notdIds) {
            const nonogram = await this.catalog.getNonogram(nonogramId);
            if (nonogram == undefined) {
                continue;
            }

            const savestate = getSavestateForNonogram(savefile, nonogramId);
            const nonogramState = savestate ? 
                new NonogramState(nonogram.rowHints, nonogram.colHints, savestate.cells) : 
                NonogramState.empty(nonogram.rowHints, nonogram.colHints);
                
            const button = NonogramButton.withMaximumSize(
                nonogramState,
                200, 200,
                () => this.onNonogramSelected(nonogramId)
            );
            button.create(this.view);
            button
        }

        return this.view;
    }

    cleanup(): void {
        // Nothing to do
    }
    
}