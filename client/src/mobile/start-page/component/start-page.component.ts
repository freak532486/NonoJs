import startPage from "./start-page.html"
import notdLinkTemplate from "./notd-link-template.html"
import continuePlayingTemplate from "./continue-playing-template.html"
import innerContinuePlayingTemplate from "./continue-playing-template-inner.html"
import "./start-page.css"
import { htmlToElement } from "../../../common/services/html-to-element";
import { StartPageNonogramSelector } from "../../../common/services/start-page/start-page-nonogram-selector";
import { CatalogAccess } from "../../../common/services/catalog/catalog-access";
import { NonogramPreview } from "../../../common/components/nonogram-preview/nonogram-preview.component";
import { CellKnowledge, NonogramState } from "../../../common/types/nonogram-types";
import SavefileAccess from "../../../common/services/savefile/savefile-access"
import { SavefileUtils } from "../../../common/services/savefile/savefile-utils"
import UIComponent from "../../../common/types/ui-component"
import BoxComponent from "../../../common/components/box/box.component";
import Color from "../../../common/types/color";
import QuickplayComponent from "../../../common/components/quickplay/component";
import { Nonogram } from "nonojs-common"

export class StartPage implements UIComponent {
    #view: HTMLElement;
    #nonogramSelector: StartPageNonogramSelector;

    /* Listeners */
    #onNonogramSelected: (nonogramId: string) => void = () => {};
    #onOpenCatalog: () => void = () => {};
    #onOpenSettings: () => void = () => {};
    #onLogin: () => void = () => {};


    /**
     * Creates a new start page object.
     */
    constructor (
        private readonly catalogAccess: CatalogAccess,
        private readonly savefileAccess: SavefileAccess
    )
    {
        this.#view = htmlToElement(startPage);
        this.setLoggedInUsername(undefined);
        this.#nonogramSelector = new StartPageNonogramSelector(catalogAccess, savefileAccess);
    }


    /**
     * Creates this component and attaches it to the given parent. 
     */
    async create(parent: HTMLElement): Promise<HTMLElement> {
        /* Append to parent */
        parent.appendChild(this.#view);

        /* Continue */
        const savefile = await this.savefileAccess.getSavefile();

        const continueRoot = this.#view.querySelector("#continue-root") as HTMLElement;
        const continueContainer = continueRoot.querySelector(".container") as HTMLElement;
        if (savefile.activeNonogramIds.length > 0) {
            for (const nonogramId of savefile.activeNonogramIds) {
                const continueBox = await this.#createContinueButton(nonogramId);
                if (continueBox == undefined) {
                    continue;
                }

                continueContainer.appendChild(continueBox);
            }
        } else {
            continueRoot.style.display = "none";
        }

        /* Quickplay (should go after continue) */
        const quickplayBox = new BoxComponent("Quickplay", Color.fromHex("#ff5e00"));
        quickplayBox.create(this.#view);

        quickplayBox.view.remove();
        continueRoot.before(quickplayBox.view);

        const quickplayComp = new QuickplayComponent(
            this.savefileAccess,
            this.catalogAccess,
            this.#onNonogramSelected
        );
        quickplayComp.create(quickplayBox.content);

        /* Nonograms of the day */
        const notdContainer = this.#view.querySelector(".box.notd>.box-content")  as HTMLElement;
        const notdIds = await this.#nonogramSelector.getNonogramIdsOfTheDay();
        for (const notdId of notdIds) {
            const nonogramOfTheDay = await this.catalogAccess.getNonogram(notdId);
            if (!nonogramOfTheDay) {
                continue;
            }

            const button = await this.#createNonogramOfTheDayButton(nonogramOfTheDay);
            button.onclick = () => this.#onNonogramSelected(notdId);
            notdContainer.appendChild(button);
        }

        /* Random nonogram */
        const btnRandom = this.#view.querySelector("#button-random")  as HTMLElement;
        btnRandom.onclick = async () => {
            const nonogramId = await this.#nonogramSelector.getRandomNonogramId();
            this.#onNonogramSelected(nonogramId);
        }

        /* Catalog */
        const btnCatalog = this.#view.querySelector("#button-catalog")  as HTMLElement;
        btnCatalog.onclick = () => this.#onOpenCatalog();

        /* Settings */
        const btnSettings = this.#view.querySelector("#button-settings")  as HTMLElement;
        btnSettings.onclick = () => this.#onOpenSettings();

        /* Login */
        const btnLogin = this.#view.querySelector("#button-login") as HTMLElement;
        btnLogin.onclick = () => this.#onLogin();

        return this.#view;
    }

    cleanup() {
        // Nothing to do
    }

    /**
     * Sets the callback for when a nonogram gets selected on the start page.
     */
    set onNonogramSelected(fn: (nonogramId: string) => void) {
        this.#onNonogramSelected = fn;
    }

    /**
     * Sets the callback for when the catalog should be opened.
     */
    set onOpenCatalog(fn: () => void) {
        this.#onOpenCatalog = fn;
    }

    /**
     * Sets the callback for when the settings should be opened.
     */
    set onOpenSettings(fn: () => void) {
        this.#onOpenSettings = fn;
    }

    /**
     * Sets the callback for when the login dialog should be opened.
     */
    set onLogin(fn: () => void) {
        this.#onLogin = fn;
    }

    /**
     * Creates a nonogram-of-the-day button.
     */
    async #createNonogramOfTheDayButton(nonogram: Nonogram): Promise<HTMLElement> {
        const ret = htmlToElement(notdLinkTemplate);

        /* Fill body with a preview */
        const content = ret.querySelector(".preview-container") as HTMLElement;
        const savefile = await this.savefileAccess.getSavefile();
        const saveState = SavefileUtils.getSavestateForNonogram(savefile, nonogram.id);
        const cells = saveState == undefined ? undefined :
            SavefileUtils.calculateActiveState(nonogram.colHints.length, nonogram.rowHints.length, saveState.history);
        const nonogramState = cells ? 
            new NonogramState(nonogram.rowHints, nonogram.colHints, cells) : 
            NonogramState.empty(nonogram.rowHints, nonogram.colHints);
        const preview = new NonogramPreview(nonogramState);
        preview.create(content);
        limitCanvasSize(preview.view, 120, 120);

        /* Set preview text */
        const previewTextSpan = ret.querySelector(".preview-text") as HTMLElement;
        
        const numFilled = nonogramState.cells.filter(x => x != CellKnowledge.UNKNOWN).length;
        const numTotal = nonogramState.cells.length;
        const progressText = Math.floor(100 * numFilled / numTotal) + "%";

        previewTextSpan.textContent = nonogramState.width + "x" + nonogramState.height + ", " + progressText + " finished.";

        return ret;
    }

    /**
     * Creates the "continue playing"-box.
     */
    async #createContinueButton(nonogramId: string): Promise<HTMLElement | undefined> {
        const ret = htmlToElement(innerContinuePlayingTemplate);

        /* Create preview */
        const nonogram = await this.catalogAccess.getNonogram(nonogramId);
        if (nonogram == undefined) {
            return undefined;
        }

        const content = ret.querySelector(".preview-container") as HTMLElement;
        const savefile = await this.savefileAccess.getSavefile();
        const saveState = SavefileUtils.getSavestateForNonogram(savefile, nonogram.id);
        const cells = saveState == undefined ? undefined :
            SavefileUtils.calculateActiveState(nonogram.colHints.length, nonogram.rowHints.length, saveState.history);
        const nonogramState = cells ? 
            new NonogramState(nonogram.rowHints, nonogram.colHints, cells) : 
            NonogramState.empty(nonogram.rowHints, nonogram.colHints);
        const preview = new NonogramPreview(nonogramState);
        preview.create(content);
        limitCanvasSize(preview.view, 120, 120);

        content.onclick = () => this.#onNonogramSelected(nonogramId);

        /* Set preview text */
        const previewTextSpan = ret.querySelector(".preview-text") as HTMLElement;
        
        const numFilled = nonogramState.cells.filter(x => x != CellKnowledge.UNKNOWN).length;
        const numTotal = nonogramState.cells.length;
        const progressText = Math.floor(100 * numFilled / numTotal) + "%";

        previewTextSpan.textContent = nonogramState.width + "x" + nonogramState.height + ", " + progressText + " finished.";

        return ret;
    }

    /**
     * Sets the message for the currently logged-in user.
     */
    setLoggedInUsername(username: string | undefined) {
        const msgNotLoggedIn = this.#view.querySelector("#msg-not-logged-in") as HTMLElement;
        const msgLoggedIn = this.#view.querySelector("#msg-logged-in") as HTMLElement;

        if (!username) {
            msgNotLoggedIn.style.display = "inline";
            msgLoggedIn.style.display = "none";
            return;
        }

        msgNotLoggedIn.style.display = "none";
        msgLoggedIn.style.display = "inline";

        const usernameSpan = msgLoggedIn.querySelector(".username") as HTMLElement;
        usernameSpan.textContent = username;
    }

}

/**
 * Scales the given canvas to fit into the given bounds.
 */
function limitCanvasSize(canvas: HTMLCanvasElement, maxWidth: number, maxHeight: number)
{
    const hScale = Math.min(1, maxWidth / canvas.width);
    const vScale = Math.min(1, maxHeight / canvas.height);
    const scale = Math.min(hScale, vScale);

    canvas.style.width = (canvas.width * scale) + "px";
    canvas.style.height = (canvas.height * scale) + "px";
}