import template from "./template.html"
import "./style.css"
import UIComponent from "../../../common/types/ui-component"
import { htmlToElement } from "../../../common/services/html-to-element";
import BoxComponent from "../../../common/components/box/box.component";
import Color from "../../../common/types/color";

export default class NonogramDesktopControls implements UIComponent
{
    private readonly view: HTMLElement;

    constructor()
    {
        this.view = htmlToElement(template);
    }

    create(parent: HTMLElement): HTMLElement {
        parent.appendChild(this.view);
        return this.view;
    }

    cleanup(): void {
        // Nothing to do
    }
    
}