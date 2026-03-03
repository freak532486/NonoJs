import UIComponent from "../../common/types/ui-component";
import template from "./template.html"
import "./style.css"
import { htmlToElement } from "../../common/services/html-to-element";
import BoxComponent from "../../common/components/box/box.component";
import Color from "../../common/types/color";
import NonogramsOfTheDay from "./notd/nonogram-of-the-day.component";
import { CatalogAccess } from "../../common/services/catalog/catalog-access";
import { StartPageNonogramSelector } from "../../common/services/start-page/start-page-nonogram-selector";
import LoginBox from "./login-box/login-box.component";
import LinkCollection from "./navigation/navigation.component";
import SavefileAccess from "../../common/services/savefile/savefile-access";
import AuthService from "../../common/services/auth/auth-service";
import ContinuePlaying from "./continue-playing/continue-playing.component";

export default class StartPage implements UIComponent
{

    private view: HTMLElement;
    private nonogramSelector: StartPageNonogramSelector;

    constructor(
        private readonly authService: AuthService,
        private readonly catalogAccess: CatalogAccess,
        private readonly savefileAccess: SavefileAccess,
        private readonly onNonogramSelected: (nonogramId: string) => void
    )
    {
        this.view = htmlToElement(template);
        this.nonogramSelector = new StartPageNonogramSelector(catalogAccess, savefileAccess);
    }

    async create(parent: HTMLElement): Promise<HTMLElement> {
        const leftCol = this.view.querySelector(".left") as HTMLDivElement;
        const centerCol = this.view.querySelector(".center") as HTMLDivElement;
        const rightCol = this.view.querySelector(".right") as HTMLDivElement;

        this.authService.getCurrentUsername().then(activeUsername => {
            const loginBox = new LoginBox(activeUsername, () => {}, () => {});
            loginBox.create(leftCol);
        });

        const lastPlayedNonogramId = (await this.savefileAccess.fetchLocalSavefile()).lastPlayedNonogramId;
        if (lastPlayedNonogramId !== undefined) {
            const continueBox = new BoxComponent("Continue playing", Color.RED);
            continueBox.view.classList.add("continue-box");
            continueBox.create(centerCol);

            const continuePlaying = new ContinuePlaying(
                this.catalogAccess,
                this.savefileAccess,
                lastPlayedNonogramId,
                () => this.onNonogramSelected(lastPlayedNonogramId)
            );

            await continuePlaying.create(continueBox.content);
        }

        const nonogramsOfTheDayBox = new BoxComponent("Nonograms of the day", Color.YELLOW);
        nonogramsOfTheDayBox.view.classList.add("notd-box");
        nonogramsOfTheDayBox.create(centerCol);

        const nonogramsOfTheDay = new NonogramsOfTheDay(
            this.catalogAccess,
            this.savefileAccess,
            this.nonogramSelector,
            nonogramId => this.onNonogramSelected(nonogramId)
        );
        nonogramsOfTheDay.create(nonogramsOfTheDayBox.content);

        const navigationBox = new BoxComponent("Other", Color.GREEN);
        new LinkCollection().create(navigationBox.content);
        navigationBox.create(centerCol);

        parent.appendChild(this.view);
        return this.view;
    }

    cleanup(): void {
        // Nothing to do
    }

}