import template from "./template.html"
import "./style.css"
import UIComponent from "../../common/types/ui-component"
import { htmlToElement } from "../../common/services/html-to-element"

export default class Header implements UIComponent
{
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
}