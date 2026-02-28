import Route from "../../common/services/routing/route";
import { StartPage } from "../start-page/component/start-page.component";
import { Component } from "nonojs-common";
import tokens from "../../common/tokens";
import { navigateTo } from "../../common/services/navigate-to";

export default class StartpageRoute extends Component implements Route
{

    matches(path: string): boolean {
        return path == "/";
    }

    async run(path: string) {
        const catalogAccess = this.ctx.getComponent(tokens.catalogAccess);
        const savefileAccess = this.ctx.getComponent(tokens.savefileAccess);
        const authService = this.ctx.getComponent(tokens.authService);
        const activeComponentManager = this.ctx.getComponent(tokens.activeComponentManager);

        let startPage = new StartPage(catalogAccess, savefileAccess);
        startPage.onNonogramSelected = nonogramId => navigateTo("/n/" + nonogramId);
        startPage.onLogin = () => navigateTo("/login");
        startPage.onOpenCatalog = () => navigateTo("/catalog");
        startPage.onOpenSettings = () => navigateTo("/settings");
        startPage.setLoggedInUsername(await authService.getCurrentUsername());

        activeComponentManager.setActiveComponent(startPage);
        document.title = "NonoJs · Free Nonogram Platform";
    }
    
}