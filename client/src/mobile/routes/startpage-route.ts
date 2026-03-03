import Route from "../../common/services/routing/route";
import { StartPage } from "../start-page/component/start-page.component";
import { Component } from "nonojs-common";
import tokens from "../../common/tokens";
import { navigateTo } from "../../common/services/navigate-to";
import SavefileAccess from "../../common/services/savefile/savefile-access";

export default class StartpageRoute extends Component implements Route
{

    constructor(
        private readonly savefileAccess: SavefileAccess
    )
    {
        super();
    }

    matches(path: string): boolean {
        return path == "/";
    }

    async run(path: string) {
        const catalogAccess = this.ctx.getComponent(tokens.catalogAccess);
        const authService = this.ctx.getComponent(tokens.authService);
        const activeComponentManager = this.ctx.getComponent(tokens.activeComponentManager);

        let startPage = new StartPage(catalogAccess, this.savefileAccess);
        startPage.onNonogramSelected = nonogramId => navigateTo("/n/" + nonogramId);
        startPage.onLogin = () => navigateTo("/login");
        startPage.onOpenCatalog = () => navigateTo("/catalog");
        startPage.onOpenSettings = () => navigateTo("/settings");
        startPage.setLoggedInUsername(await authService.getCurrentUsername());

        activeComponentManager.setActiveComponent(startPage);
        document.title = "NonoJs · Free Nonogram Platform";
    }
    
}