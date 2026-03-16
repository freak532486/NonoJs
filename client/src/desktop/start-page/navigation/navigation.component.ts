import UIComponent from "../../../common/types/ui-component";
import template from "./template.html"
import "./style.css"
import { htmlToElement } from "../../../common/services/html-to-element";
import DesktopStartpageSettingsHandler from "../settings/settings-handler";
import { CatalogAccess } from "../../../common/services/catalog/catalog-access";


export default class LinkCollection implements UIComponent
{
    public readonly view;

    constructor(
        private readonly catalogAccess: CatalogAccess,
        private readonly onNonogramSelected: (nonogramId: string) => void,
        settingsHandler: DesktopStartpageSettingsHandler
    )
    {
        this.view = htmlToElement(template);

        const settingsLink = this.view.querySelector(".settings") as HTMLElement;
        settingsLink.onclick = () => settingsHandler.showSettings();

        const randomNonogramLink = this.view.querySelector(".random-nonogram") as HTMLElement;
        randomNonogramLink.onclick = () => this.playRandomNonogram();
    }

    create(parent: HTMLElement): HTMLElement {
        parent.appendChild(this.view);
        return this.view;
    }

    cleanup(): void {
        // Nothing to do
    }

    private async playRandomNonogram()
    {
        const allNonograms = await this.catalogAccess.getAllNonograms();
        const r = Math.floor(Math.random() * allNonograms.length);
        this.onNonogramSelected(allNonograms[r].id);
    }
    
}