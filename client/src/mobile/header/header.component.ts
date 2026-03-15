import { htmlToElement } from "../../common/services/html-to-element";
import header from "./header.html"
import "./header.css"
import UIComponent from "../../common/types/ui-component.js";
import { Menu } from "../menu/menu.component";

export class Header implements UIComponent {

    #view?: HTMLElement;
    #onLogoClicked: () => void = () => {};

    constructor(
        private readonly menu: Menu
    ) {}

    create(parent: HTMLElement): HTMLElement
    {
        this.#view = htmlToElement(header);
        parent.appendChild(this.view);

        const imgLogo = this.#view.querySelector("#logo") as HTMLElement;
        imgLogo.onclick = () => this.#onLogoClicked();

        const btnMenu = this.view.querySelector(".button.menu") as HTMLElement;
        btnMenu.onclick = () => this.menu.toggle();

        return this.#view;
    }

    cleanup()
    {
        // Nothing to do
    }

    get view()
    {
        if (!this.#view) {
            throw new Error("init() was not called.");
        }

        return this.#view;
    }

    /**
     * Sets the callback for when the logo image is clicked.
     */
    set onLogoClicked(fn: () => void)
    {
        this.#onLogoClicked = fn;
    }

}