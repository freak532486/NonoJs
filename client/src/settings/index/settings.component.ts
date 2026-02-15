import template from "./settings.html"
import "./settings.css"
import { htmlToElement } from "../../loader";
import SettingEntriesManager from "../entries/setting-entries-manager";
import SavefileAccess from "../../savefile/savefile-access";
import UIComponent from "../../common/ui-component";
import AuthService from "../../auth/auth-service";

export default class Settings implements UIComponent
{
    #view: HTMLElement;
    #entriesManager: SettingEntriesManager;

    constructor(
        savefileAccess: SavefileAccess,
        authService: AuthService,
        mergeLocalSavefileWithAccount: () => void,
        deleteActiveAccount: () => void
    )
    {
        this.#view = htmlToElement(template);
        this.#entriesManager = new SettingEntriesManager(
            this,
            savefileAccess,
            authService,
            mergeLocalSavefileWithAccount,
            deleteActiveAccount
        );
    }

    async create(parent: HTMLElement): Promise<HTMLElement>
    {
        parent.appendChild(this.#view);
        await this.#entriesManager.createSettingsEntries();
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