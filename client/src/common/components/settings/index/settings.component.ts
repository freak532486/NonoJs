import template from "./settings.html"
import "./settings.css"
import SettingEntriesManager from "../entries/setting-entries-manager";
import UIComponent from "../../../types/ui-component";
import SavefileAccess from "../../../services/savefile/savefile-access";
import AuthService from "../../../services/auth/auth-service";
import { htmlToElement } from "../../../services/html-to-element";
import { CatalogAccess } from "../../../services/catalog/catalog-access";

export default class Settings implements UIComponent
{
    #view: HTMLElement;
    #entriesManager: SettingEntriesManager;

    constructor(
        savefileAccess: SavefileAccess,
        authService: AuthService,
        catalogAccess: CatalogAccess
    )
    {
        this.#view = htmlToElement(template);
        this.#entriesManager = new SettingEntriesManager(
            this,
            savefileAccess,
            authService,
            catalogAccess
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