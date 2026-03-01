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

        const leftCol = this.#view.querySelector(".left") as HTMLDivElement;
        const centerCol = this.#view.querySelector(".center") as HTMLDivElement;
        const rightCol = this.#view.querySelector(".right") as HTMLDivElement;

        const navBox = new BoxComponent("Navigation", Color.BLUE);
        navBox.create(leftCol);

        const continueBox = new BoxComponent("Continue playing", Color.RED);
        continueBox.view.classList.add("continue-box");
        continueBox.create(centerCol);

        const nonogramsOfTheDayBox = new BoxComponent("Nonograms of the day", Color.YELLOW);
        nonogramsOfTheDayBox.view.classList.add("notd-box");
        nonogramsOfTheDayBox.create(centerCol);

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