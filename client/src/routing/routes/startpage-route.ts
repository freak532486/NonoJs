import Route from "../route";
import * as app from "../../app"
import { StartPage } from "../../start-page/component/start-page.component";
import ActiveComponentManager from "../../active-component-manager";
import { StartPageNonogramSelector } from "../../start-page/internal/start-page-nonogram-selector";
import { CatalogAccess } from "../../catalog/catalog-access";
import SavefileAccess from "../../savefile/savefile-access";

export default class StartpageRoute implements Route
{
    constructor(
        private readonly activeComponentManager: ActiveComponentManager,
        private readonly catalogAccess: CatalogAccess,
        private readonly savefileAccess: SavefileAccess,
        private readonly getActiveUsername: () => string | undefined
    ) {}

    matches(path: string): boolean {
        return path == "/";
    }

    run(path: string) {
        let startPage = new StartPage(this.catalogAccess, this.savefileAccess);
        startPage.onNonogramSelected = nonogramId => app.navigateTo("/n/" + nonogramId);
        startPage.onLogin = () => app.navigateTo("/login");
        startPage.onOpenCatalog = () => app.navigateTo("/catalog");
        startPage.onOpenSettings = () => app.navigateTo("/settings");
        startPage.setLoggedInUsername(this.getActiveUsername());


        this.activeComponentManager.setActiveComponent(startPage);
        document.title = "NonoJs · Free Nonogram Platform";
    }
    
}