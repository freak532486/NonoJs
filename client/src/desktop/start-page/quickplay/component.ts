import template from "./template.html"
import "./style.css"
import UIComponent from "../../../common/types/ui-component";
import { htmlToElement } from "../../../common/services/html-to-element";
import { CatalogAccess } from "../../../common/services/catalog/catalog-access";

export default class DesktopQuickplayComponent implements UIComponent
{
    private view: HTMLElement;

    constructor(
        private readonly catalogAccess: CatalogAccess,
        private readonly onNonogramSelected: (nonogramId: string) => void
    )
    {
        this.view = htmlToElement(template);

        /* Assign button functions */
        const btn10x10 = this.view.querySelector("#btn-10x10") as HTMLButtonElement;
        const btn15x15 = this.view.querySelector("#btn-15x15") as HTMLButtonElement;
        const btn20x20 = this.view.querySelector("#btn-20x20") as HTMLButtonElement;
        const btn30x30 = this.view.querySelector("#btn-30x30") as HTMLButtonElement;
        const btn40x40 = this.view.querySelector("#btn-40x40") as HTMLButtonElement;
        const btnLarge = this.view.querySelector("#btn-large") as HTMLButtonElement;

        btn10x10.onclick = () => this.selectRandomNonogram(0, 0, 10, 10);
        btn15x15.onclick = () => this.selectRandomNonogram(10, 10, 15, 15);
        btn20x20.onclick = () => this.selectRandomNonogram(15, 15, 20, 20);
        btn30x30.onclick = () => this.selectRandomNonogram(20, 20, 30, 30);
        btn40x40.onclick = () => this.selectRandomNonogram(30, 30, 40, 40);
        btnLarge.onclick = () => this.selectRandomNonogram(40, 40, 1000, 1000);
    }

    create(parent: HTMLElement): HTMLElement {
        parent.appendChild(this.view);
        return this.view;
    }

    private async selectRandomNonogram(minWidth: number, minHeight: number, maxWidth: number, maxHeight: number) {
        const possibleNonograms = (await this.catalogAccess.getAllNonograms())
            .filter(nonogram => 
                nonogram.colHints.length > minWidth &&
                nonogram.colHints.length <= maxWidth &&
                nonogram.rowHints.length > minHeight &&
                nonogram.rowHints.length <= maxHeight
            );

        if (possibleNonograms.length == 0) {
            throw new Error("No nonogram available for quickplay.");
        }

        const r = Math.floor(Math.random() * possibleNonograms.length);
        this.onNonogramSelected(possibleNonograms[r].id);
    }

    cleanup(): void {
        // Nothing to do
    }
}