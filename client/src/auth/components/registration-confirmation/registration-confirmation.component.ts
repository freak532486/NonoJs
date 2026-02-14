import template from "./registration-confirmation.html"
import "./registration-confirmation.css"
import "../../../common/styles/boxes.css"
import { htmlToElement } from "../../../loader";
import UIComponent from "../../../common/ui-component";
import { Context } from "nonojs-common";

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