import { htmlToElement } from "../../services/html-to-element";
import UIComponent from "../../types/ui-component";
import template from "./template.html"
import "./style.css"
import Color from "../../types/color";

export default class BoxComponent implements UIComponent
{

    #view: HTMLElement;

    /**
     * Creates a box with the given title and color.
     */
    constructor(title: string, color: Color) {
        const fade = 0.6;
        const fadedColor = new Color(
            Math.floor(255 * fade + color.r * (1 - fade)),
            Math.floor(255 * fade + color.g * (1 - fade)),
            Math.floor(255 * fade + color.b * (1 - fade))
        );

        this.#view = htmlToElement(template);
        this.header.textContent = title;
        this.header.style.backgroundColor = fadedColor.cssString;
    }

    create(parent: HTMLElement): HTMLElement {
        parent.appendChild(this.#view);
        return this.#view;
    }

    cleanup(): void {
        // Nothing to do
    }

    /**
     * Returns the root element of this box.
     */
    get view(): HTMLElement
    {
        return this.#view;
    }

    /**
     * Returns the header element of this box.
     */
    get header(): HTMLSpanElement
    {
        return this.#view.querySelector(":scope > .box-header") as HTMLSpanElement;
    }

    /**
     * Returns the content container of this box.
     */
    get content(): HTMLDivElement
    {
        return this.#view.querySelector(":scope > .box-content") as HTMLDivElement;
    }

}