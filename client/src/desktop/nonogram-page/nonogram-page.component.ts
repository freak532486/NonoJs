import template from "./template.html"
import controlsTemplate from "./controls.html"
import timerTemplate from "./timer.html"
import "./style.css"
import UIComponent from "../../common/types/ui-component";
import { htmlToElement } from "../../common/services/html-to-element";
import { PlayfieldComponent } from "../../mobile/playfield/playfield.component";
import { CatalogAccess } from "../../common/services/catalog/catalog-access";
import { deduceAll } from "../../common/services/solver/solver";
import { NonogramState } from "../../common/types/nonogram-types";
import SavefileAccess from "../../common/services/savefile/savefile-access";
import { getSavestateForNonogram } from "../../common/services/savefile/savefile-utils";
import { NonogramBoardComponent } from "../../common/components/nonogram-board/nonogram-board.component";
import BoxComponent from "../../common/components/box/box.component";
import Color from "../../common/types/color";
import NonogramDesktopControls from "./controls/nonogram-desktop-controls.component";

export default class NonogramPage implements UIComponent
{

    public readonly view: HTMLElement;

    constructor(
        private readonly nonogramId: string,
        private readonly catalogAccess: CatalogAccess,
        private readonly savefileAccess: SavefileAccess
    )
    {
        this.view = htmlToElement(template);
    }

    async create(parent: HTMLElement): Promise<HTMLElement> {
        const nonogramContainer = this.view.querySelector("#nonogram-container") as HTMLDivElement;
        const leftCol = this.view.querySelector(".left") as HTMLDivElement;
        const middleCol = this.view.querySelector(".center") as HTMLDivElement;
        const rightCol = this.view.querySelector(".right") as HTMLDivElement;

        /* Create controls */
        const controlsDiv = htmlToElement(controlsTemplate);
        const controlsBox = new BoxComponent("Controls", Color.YELLOW);
        controlsBox.create(leftCol);
        controlsBox.view.classList.add("controls-box");
        controlsBox.content.appendChild(controlsDiv);

        /* Create nonogram board */
        const nonogramBox = new BoxComponent("Nonogram View", Color.RED);
        nonogramBox.create(middleCol);

        const nonogram = await this.catalogAccess.getNonogram(this.nonogramId);
        if (!nonogram) {
            throw new Error("Nonogram with id " + this.nonogramId + "doesn't exist.");
        }

        const board = new NonogramBoardComponent(nonogram.rowHints, nonogram.colHints);
        board.create(nonogramBox.content);

        parent.appendChild(this.view);

        /* Create timer */
        const timerBox = new BoxComponent("Timer", Color.GREEN);
        timerBox.create(rightCol);

        const timerDiv = htmlToElement(timerTemplate);
        timerBox.content.appendChild(timerDiv);

        /* Add padding so that board is perfectly in the middle */
        const paddingLeft = Math.max(0, rightCol.clientWidth - leftCol.clientWidth);
        nonogramContainer.style.paddingLeft = paddingLeft + "px";

        const paddingRight = Math.max(0, leftCol.clientWidth - rightCol.clientWidth);
        nonogramContainer.style.paddingRight = paddingRight + "px";


        return this.view;
    }

    cleanup(): void {
        // Nothing to do
    }
    
}