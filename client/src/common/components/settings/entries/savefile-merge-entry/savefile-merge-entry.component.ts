import template from "./savefile-merge-entry.html"
import "./savefile-merge-entry.css"
import SavefileAccess from "../../../../services/savefile/savefile-access";
import SavefileMerger from "../../../../services/savefile/savefile-merger";
import { htmlToElement } from "../../../../services/html-to-element";
import { navigateTo } from "../../../../services/navigate-to";
import AuthService from "../../../../services/auth/auth-service";

export default class SavefileMergeEntry
{
    #view: HTMLElement;

    constructor(
        authService: AuthService,
        savefileAccess: SavefileAccess,
        username: string
    ) {
        const savefileMerger = new SavefileMerger(authService, savefileAccess);

        this.#view = htmlToElement(template.replace("$username", username));
        const button = this.#view.querySelector("#btn-savefile-merge") as HTMLButtonElement;
        button.onclick = async () => {
            const result = await savefileMerger.mergeLocalSavefileWithAccount();

            if (result == "ok") {
                navigateTo("/");
            } else if (result == "error") {
                alert("Error merging your savefile with the server.");
            } else if (result == "not_logged_in") {
                throw new Error("User was not logged in.");
            }
        }
    }

    get view() {
        return this.#view;
    }

}