import template from "./template.html"
import "./style.css"
import UIComponent from "../../common/types/ui-component"
import { htmlToElement } from "../../common/services/html-to-element"

export default class MobileRootComponent implements UIComponent
{
    #view: HTMLElement;

    constructor()
    {
        this.#view = htmlToElement(template);
    }

    /**
     * Creates this component and attaches it to the given parent container.
     */
    create(parent: HTMLElement): HTMLElement {
        parent.appendChild(this.#view);
        return this.#view;
    }

    /**
     * Performs necessary cleanup before removing this component.
     */
    cleanup(): void {
        // Nothing to do
    }

    /**
     * Returns the div that contains the application header bar.
     */
    get headerContainer(): HTMLElement
    {
        return this.#view.querySelector("#header-div") as HTMLElement;
    }

    /**
     * Returns the div that contains the main page content.
     */
    get mainContainer(): HTMLElement 
    {
        return this.#view.querySelector("#main-div") as HTMLElement;
    }
    
}