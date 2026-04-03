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
import DesktopCatalogComponent from "./catalog/component";
import DesktopAboutComponent from "./about/component";
import QuickplayComponent from "../../common/components/quickplay/component";
import DesktopStartpageSettingsHandler from "./settings/settings-handler";
import DesktopRoot from "../root-component/desktop-root";

export default class StartPage implements UIComponent
{

    private view: HTMLElement;
    private nonogramSelector: StartPageNonogramSelector;

    constructor(
        private readonly root: DesktopRoot,
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

        /* Login box */
        this.authService.getCurrentUsername().then(activeUsername => {
            const loginBox = new LoginBox(activeUsername, this.authService, () => {});
            loginBox.create(rightCol);
        });

        /* Quickplay box */
        const quickplayBox = new BoxComponent("Quickplay", Color.fromHex("#ff5e00"));
        new QuickplayComponent(
            this.savefileAccess,
            this.catalogAccess,
            this.onNonogramSelected)
        .create(quickplayBox.content);
        quickplayBox.create(centerCol);

        /* Last played nonogram box */
        const savefile = await this.savefileAccess.fetchLocalSavefile();
        if (savefile.activeNonogramIds.length !== 0) {
            const continueBox = new BoxComponent("Continue playing", Color.RED);
            continueBox.view.classList.add("continue-box");
            continueBox.create(centerCol);

            const continuePlaying = new ContinuePlaying(
                this.catalogAccess,
                this.savefileAccess,
                nonogramId => this.onNonogramSelected(nonogramId)
            );

            await continuePlaying.create(continueBox.content);
        }

        /* Nonogram of the day box */
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

        /* Catalog box */
        const catalogBox = new BoxComponent("Catalog", Color.BLUE);
        await new DesktopCatalogComponent(
            this.catalogAccess,
            this.savefileAccess,
            nonogramId => this.onNonogramSelected(nonogramId)
        ).create(catalogBox.content);
        catalogBox.create(leftCol);

        /* Links box */
        const settingsHandler = new DesktopStartpageSettingsHandler(this.savefileAccess, this.authService, this.root);
        const navigationBox = new BoxComponent("Other", Color.GREEN);
        new LinkCollection(this.catalogAccess, this.onNonogramSelected, settingsHandler).create(navigationBox.content);
        navigationBox.create(leftCol);

        /* About box */
        const aboutBox = new BoxComponent("About", Color.fromHex("#ff00ff"));
        new DesktopAboutComponent().create(aboutBox.content);
        aboutBox.create(rightCol);

        parent.appendChild(this.view);
        return this.view;
    }

    cleanup(): void {
        // Nothing to do
    }

}