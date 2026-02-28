import UIComponent from "../../../common/types/ui-component";
import template from "./template.html"
import "./style.css"
import { htmlToElement } from "../../../common/services/html-to-element";
import { NonogramState } from "../../../common/types/nonogram-types";
import { NonogramPreview } from "../../../common/components/nonogram-preview/nonogram-preview.component";

export default class NonogramDesktopPreview implements UIComponent
{

    readonly view: HTMLElement;

    constructor(
        private readonly nonogram: NonogramState
    )
    {
        this.view = htmlToElement(template);
    }

    create(parent: HTMLElement): HTMLElement {
        const previewDiv = this.view.querySelector(".preview") as HTMLElement;
        const preview = new NonogramPreview(this.nonogram);
        preview.create(previewDiv);

        const labelSpan = this.view.querySelector(".label") as HTMLElement;
        labelSpan.textContent = this.nonogram.colHints.length + "x" + this.nonogram.rowHints.length;

        parent.appendChild(this.view);
        return this.view;
    }

    cleanup(): void {
        // Nothing to do
    }

}