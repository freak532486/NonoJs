import { htmlToElement } from "../loader.js";

import menu from "./menu.html"
import "./menu.css"
import UIComponent from "../common/ui-component.js";
import { Component, Context } from "nonojs-common";

export class Menu extends Component implements UIComponent {
    
    #view?: HTMLElement;
    
    /**
     * Initializes and attaches this component.
     */
    create(parent: HTMLElement): HTMLElement {
        this.#view = htmlToElement(menu);
        parent.appendChild(this.#view);

        /* Hide by default */
        this.view.style.visibility = "hidden";

        /* Hide when tapping outside of menu area */
        const entriesElem = this.view.querySelector(".entries") as HTMLElement;
        this.view.onclick = ev => {
            if (!entriesElem.contains((ev.target as Node))) {
                this.view.style.visibility = "hidden";
            }
        }

        return this.#view;
    }

    cleanup(): void {
        // Nothing to do
    }

    get view() {
        if (!this.#view) {
            throw new Error("init() was not called");
        }

        return this.#view;
    }

    /** Shows or hides the menu */
    toggle() {
        if (this.view.style.visibility == "visible") {
            this.view.style.visibility = "hidden";
        } else {
            this.view.style.visibility = "visible";
        }
    }

    /**
     * Appends an entry to the menu.
     */
    appendElement(element: HTMLElement) {
        const entriesElem = this.view.querySelector(".entries") as HTMLElement;
        entriesElem.append(element);
    }

    /**
     * Removes all entries of the given class.
     */
    removeElements(elementClass: string) {
        const entriesElem = this.view.querySelector(".entries") as HTMLElement;
        entriesElem.querySelectorAll("." + elementClass).forEach(x => x.remove());
    }

}