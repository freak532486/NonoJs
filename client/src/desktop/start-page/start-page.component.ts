import UIComponent from "../../common/types/ui-component";
import template from "./template.html"
import "./style.css"
import { htmlToElement } from "../../common/services/html-to-element";
import BoxComponent from "../../common/components/box/box.component";
import Color from "../../common/types/color";
import NonogramsOfTheDay from "./notd/nonogram-of-the-day.component";
import { CatalogAccess } from "../../common/services/catalog/catalog-access";
import { StartPageNonogramSelector } from "../../common/services/start-page/start-page-nonogram-selector";

export default class StartPage implements UIComponent
{

    #view: HTMLElement;

    constructor(
        catalog: CatalogAccess,
        nonogramSelector: StartPageNonogramSelector
    )
    {
        this.#view = htmlToElement(template);

        const nonogramsOfTheDayBox = new BoxComponent("Nonograms of the day", Color.YELLOW);
        nonogramsOfTheDayBox.view.classList.add("notd-box");
        nonogramsOfTheDayBox.create(this.#view);

        const nonogramsOfTheDay = new NonogramsOfTheDay(catalog, nonogramSelector, () => {});
        nonogramsOfTheDay.create(nonogramsOfTheDayBox.content);
    }

    create(parent: HTMLElement): HTMLElement {
        parent.appendChild(this.#view);
        return this.#view;
    }

    cleanup(): void {
        // Nothing to do
    }

}