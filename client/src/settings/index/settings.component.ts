import template from "./settings.html"
import "./settings.css"
import { htmlToElement } from "../../loader";
import SettingEntriesManager from "../entries/setting-entries-manager";
import SavefileAccess from "../../savefile/savefile-access";
import UIComponent from "../../common/ui-component";

export default class Settings implements UIComponent
{
    #view: HTMLElement;
    #entriesManager: SettingEntriesManager;

    constructor(
        savefileAccess: SavefileAccess,
        getActiveUsername: () => string | undefined,
        mergeLocalSavefileWithAccount: () => void,
        deleteActiveAccount: () => void
    )
    {
        this.#view = htmlToElement(template);
        this.#entriesManager = new SettingEntriesManager(
            this,
            savefileAccess,
            getActiveUsername,
            mergeLocalSavefileWithAccount,
            deleteActiveAccount
        );
    }

    create(parent: HTMLElement): HTMLElement
    {
        parent.appendChild(this.#view);
        this.#entriesManager.createSettingsEntries();
        return this.#view;
    }

    cleanup(): void {
        // Nothing to do
    }

    addEntry(entry: HTMLElement)
    {
        entry.classList.add("settings-entry");
        const entriesContainer = this.#view.querySelector("#entries") as HTMLElement;
        entriesContainer.appendChild(entry);
    }
}