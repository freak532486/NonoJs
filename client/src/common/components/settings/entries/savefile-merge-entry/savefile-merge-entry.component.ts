import template from "./savefile-merge-entry.html"
import "./savefile-merge-entry.css"
import SavefileAccess from "../../../../services/savefile/savefile-access";
import SavefileMerger from "../../../../services/savefile/impl/savefile-merger";
import { htmlToElement } from "../../../../services/html-to-element";
import { navigateTo } from "../../../../services/navigate-to";
import AuthService from "../../../../services/auth/auth-service";
import { CatalogAccess } from "../../../../services/catalog/catalog-access";

export default class SavefileMergeEntry
{
    #view: HTMLElement;

    constructor(
        authService: AuthService,
        savefileAccess: SavefileAccess,
        catalogAccess: CatalogAccess,
        username: string
    ) {
        const savefileMerger = new SavefileMerger(catalogAccess);

        this.#view = htmlToElement(template.replace("$username", username));
        const button = this.#view.querySelector("#btn-savefile-merge") as HTMLButtonElement;
        button.onclick = async () => {
            const userlessSavefile = await savefileAccess.getSavefile("USERLESS");
            const userSavefile = await savefileAccess.getSavefile();
            const merged = await savefileMerger.mergeSavefiles(userlessSavefile, userSavefile);
            await savefileAccess.writeSavefile(merged);
            navigateTo("/");
        }
    }

    get view() {
        return this.#view;
    }

}