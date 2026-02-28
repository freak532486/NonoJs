import { htmlToElement } from "../../common/services/html-to-element";
import UIComponent from "../../common/types/ui-component";
import template from "./template.html"
import "./style.css"

export default class DesktopRoot implements UIComponent {

    #view: HTMLElement;

    constructor()
    {
        this.#view = htmlToElement(template);
    }

    create(parent: HTMLElement): HTMLElement {
        parent.appendChild(this.#view);
        return this.#view;
    }

    cleanup(): void {
        // Nothing to do
    }

    /**
     * Returns the root header div.
     */
    get headerContainer(): HTMLElement
    {
        return this.#view.querySelector(".header") as HTMLElement;
    }

    /**
     * Returns the root main div.
     */
    get mainContainer(): HTMLElement
    {
        return this.#view.querySelector(".main") as HTMLElement;
    }
    
}