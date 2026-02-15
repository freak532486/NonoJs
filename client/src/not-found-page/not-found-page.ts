import template from "./not-found-page.html"
import "./not-found-page.css"
import UIComponent from "../common/ui-component";
import { htmlToElement } from "../loader";

export class NotFoundPage implements UIComponent {

    #view?: HTMLElement;

    /**
     * Creates the not found page. This will overwrite the entire page content.
     */
    create(parent: HTMLElement): HTMLElement {
        this.#view = htmlToElement(template);
        parent.appendChild(this.#view);
        return this.#view;
    }

    cleanup(): Promise<void> | void {
        // Nothing to do
    }

}