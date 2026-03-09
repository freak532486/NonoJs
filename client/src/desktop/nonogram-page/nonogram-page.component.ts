import template from "./template.html"
import controlsTemplate from "./controls.html"
import timerTemplate from "./timer.html"
import "./style.css"
import UIComponent from "../../common/types/ui-component";
import { htmlToElement } from "../../common/services/html-to-element";
import { CatalogAccess } from "../../common/services/catalog/catalog-access";
import SavefileAccess from "../../common/services/savefile/savefile-access";
import { NonogramBoardComponent } from "../../common/components/nonogram-board/nonogram-board.component";
import BoxComponent from "../../common/components/box/box.component";
import Color from "../../common/types/color";
import NonogramKeyboardListener from "./key-listener";
import NonogramController from "./controller";
import { NonogramColor, NonogramComponentState } from "./state";
import NonogramViewUpdater from "./view-update";
import NonogramButtonsListener from "./buttons-listener";

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

        const state = new NonogramComponentState(nonogram.rowHints, nonogram.colHints);
        const board = new NonogramBoardComponent(nonogram.rowHints, nonogram.colHints);
        board.create(nonogramBox.content);
        parent.appendChild(this.view);

        /* Buttons */
        const btnBlack = this.view.querySelector("#btn-black") as HTMLButtonElement;
        btnBlack.onclick = () => state.chosenColor = NonogramColor.BLACK;

        const btnWhite = this.view.querySelector("#btn-white") as HTMLButtonElement;
        btnWhite.onclick = () => state.chosenColor = NonogramColor.WHITE;

        const btnUndo = this.view.querySelector("#btn-undo") as HTMLButtonElement;
        btnUndo.onclick = () => state.undo();

        const btnRedo = this.view.querySelector("#btn-redo") as HTMLButtonElement;
        btnRedo.onclick = () => state.redo();

        /* State Listeners */
        const viewUpdater = new NonogramViewUpdater(state, board);
        state.listeners.push(viewUpdater);

        const buttonsUpdater = new NonogramButtonsListener(state, btnUndo, btnRedo, btnBlack, btnWhite);
        state.listeners.push(buttonsUpdater);

        /* Create keyboard listener */
        const keyboardListener = new NonogramKeyboardListener(state);
        window.addEventListener("keyup", ev => keyboardListener.onKeyUp(ev));
        window.addEventListener("keydown", ev => keyboardListener.onKeyDown(ev));

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