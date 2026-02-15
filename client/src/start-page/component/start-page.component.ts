import startPage from "./start-page.html"
import notdLinkTemplate from "./notd-link-template.html"
import continuePlayingTemplate from "./continue-playing-template.html"
import "./start-page.css"
import "../../common/styles/boxes.css"
import { htmlToElement } from "../../loader";
import { StartPageNonogramSelector } from "../internal/start-page-nonogram-selector";
import { CatalogAccess } from "../../catalog/catalog-access";
import { SerializedNonogram } from "../../common/storage-types";
import { NonogramPreview } from "../../nonogram-preview/nonogram-preview.component";
import { CellKnowledge, NonogramState } from "../../common/nonogram-types";
import SavefileAccess from "../../savefile/savefile-access"
import { getSavestateForNonogram } from "../../savefile/savefile-utils"
import { Context } from "nonojs-common"
import UIComponent from "../../common/ui-component"

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

        /* Register listeners */
        /* Continue */
        const continueRoot = this.#view.querySelector("#continue-root") as HTMLElement;
        const lastPlayedId = await this.#nonogramSelector.getLastPlayedNonogramId();
        const lastPlayed = lastPlayedId && await this.catalogAccess.getNonogram(lastPlayedId);
        if (lastPlayed) {
            const continueBox = await this.#createContinueButton(lastPlayed);
            continueRoot.appendChild(continueBox);

            const btnContinue = continueBox.querySelector("#button-continue")  as HTMLElement;
            btnContinue.onclick = () => this.#onNonogramSelected(lastPlayedId);
        }

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
    async #createNonogramOfTheDayButton(nonogram: SerializedNonogram): Promise<HTMLElement> {
        const ret = htmlToElement(notdLinkTemplate);

        /* Fill body with a preview */
        const content = ret.querySelector(".preview-container") as HTMLElement;
        const savefile = await this.savefileAccess.fetchLocalSavefile();
        const cells = getSavestateForNonogram(savefile, nonogram.id)?.cells;
        const nonogramState = cells ? 
            new NonogramState(nonogram.rowHints, nonogram.colHints, cells) : 
            NonogramState.empty(nonogram.rowHints, nonogram.colHints);
        const preview = new NonogramPreview(nonogramState, 120, 120);
        preview.create(content);

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
    async #createContinueButton(nonogram: SerializedNonogram): Promise<HTMLElement> {
        const ret = htmlToElement(continuePlayingTemplate);

        /* Create preview */
        const content = ret.querySelector(".preview-container") as HTMLElement;
        const savefile = await this.savefileAccess.fetchLocalSavefile();
        const saveState = getSavestateForNonogram(savefile, nonogram.id);
        const cells = saveState?.cells;
        const nonogramState = cells ? 
            new NonogramState(nonogram.rowHints, nonogram.colHints, cells) : 
            NonogramState.empty(nonogram.rowHints, nonogram.colHints);
        const preview = new NonogramPreview(nonogramState, 120, 120);
        preview.create(content);

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