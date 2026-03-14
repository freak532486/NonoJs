import { htmlToElement } from "../../common/services/html-to-element";
import UIComponent from "../../common/types/ui-component";
import template from "./template.html"
import "./style.css"
import DesktopRootPopupHandler from "./impl/popup-handler";
import Color from "../../common/types/color";

export default class DesktopRoot implements UIComponent {

    private view: HTMLElement;

    private popupHandler: DesktopRootPopupHandler;

    constructor()
    {
        this.view = htmlToElement(template);
        this.popupHandler = new DesktopRootPopupHandler(this.view.querySelector(".overlay") as HTMLDivElement);
    }

    create(parent: HTMLElement): HTMLElement {
        parent.appendChild(this.view);
        return this.view;
    }

    cleanup(): void {
        // Nothing to do
    }

    /**
     * Returns the root header div.
     */
    get headerContainer(): HTMLElement
    {
        return this.view.querySelector(".header") as HTMLElement;
    }

    /**
     * Returns the root main div.
     */
    get mainContainer(): HTMLElement
    {
        return this.view.querySelector(".main") as HTMLElement;
    }

    /**
     * Shows a popup window. Returns the content area of that popup window, to which you can add your own elements.
     */
    showPopup(title: string, color: Color): HTMLElement {
        return this.popupHandler.showPopup(title, color);
    }


    
}