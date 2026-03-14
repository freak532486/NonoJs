import template from "./delete-account-entry.html"
import "./delete-account-entry.css"
import AuthService from "../../../../services/auth/auth-service";
import { htmlToElement } from "../../../../services/html-to-element";
import { navigateTo } from "../../../../services/navigate-to";

export default class DeleteAccountEntry
{
    #view: HTMLElement;

    constructor(
        authService: AuthService,
        username: string
    ) {
        this.#view = htmlToElement(template.replace("$username", username));
        const button = this.#view.querySelector("#btn-delete-account") as HTMLButtonElement;
        const textField = this.#view.querySelector("#input-username-delete-account") as HTMLInputElement;

        button.disabled = textField.value !== username;
        textField.oninput = () => {
            button.disabled = textField.value !== username;
        }

        button.onclick = async () => {
            await authService.deleteActiveUser();
            navigateTo("/");
        }
    }

    get view() {
        return this.#view;
    }
}