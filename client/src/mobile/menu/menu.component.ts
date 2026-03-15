import { htmlToElement } from "../../common/services/html-to-element";
import menu from "./menu.html"
import "./menu.css"
import UIComponent from "../../common/types/ui-component.js";

export class Menu implements UIComponent {
    
    public readonly view: HTMLElement;

    constructor()
    {
        this.view = htmlToElement(menu);
    }
    
    /**
     * Initializes and attaches this component.
     */
    create(parent: HTMLElement): HTMLElement {
        parent.appendChild(this.view);

        /* Hide by default */
        this.view.style.visibility = "hidden";

        /* Hide when tapping outside of menu area */
        const entriesElem = this.view.querySelector(".entries") as HTMLElement;
        this.view.onclick = ev => {
            if (!entriesElem.contains((ev.target as Node))) {
                this.view.style.visibility = "hidden";
            }
        }

        return this.view;
    }

    cleanup(): void {
        // Nothing to do
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