import template from "./registration-confirmation.html"
import "./registration-confirmation.css"
import { htmlToElement } from "../../../../../common/services/html-to-element";
import UIComponent from "../../../../../common/types/ui-component";

export default class RegistrationConfirmationComponent implements UIComponent
{
    #view: HTMLElement;

    constructor() {
        this.#view = htmlToElement(template);
    }

    create(parent: HTMLElement) {
        parent.appendChild(this.#view);
        return this.#view;
    }

    cleanup(): void {
        // Nothing to do
    }

    setTitle(title: string) {
        const headerElem = this.#view.querySelector(".box-header") as HTMLElement;
        headerElem.textContent = title;
    }

    setMessage(msg: string) {
        const msgElem = this.#view.querySelector(".box-content .message") as HTMLElement;
        msgElem.textContent = msg;
    }
}