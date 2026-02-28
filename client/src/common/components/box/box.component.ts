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
        const fadedColor = new Color(color.r, color.g, color.b, 0x30);
        this.#view = htmlToElement(template);
        this.header.textContent = title;
        this.header.style.background = `linear-gradient(#ffffff00 -100%, ${fadedColor.cssString} 100%)`;
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