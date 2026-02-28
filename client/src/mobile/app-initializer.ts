import { Component } from "nonojs-common";
import tokens from "../common/tokens";
import DefaultMenuButtonManager from "./menu/button-managers/default-menu-button-manager";
import MobileRootComponent from "./root-component/mobile-root";
import { navigateTo } from "../common/services/navigate-to";

export default class AppInitializer extends Component
{

    constructor(
        private readonly mobileRoot: MobileRootComponent
    ) {
        super();
    }

    async initApp() {
        const catalogAccess = this.ctx.getComponent(tokens.catalogAccess);
        const savefileManager = this.ctx.getComponent(tokens.savefileManager);
        const savefileMigrator = this.ctx.getComponent(tokens.savefileMigrator);
        const authService = this.ctx.getComponent(tokens.authService);
        const router = this.ctx.getComponent(tokens.router);
        const menu = this.ctx.getComponent(tokens.menu);
        const header = this.ctx.getComponent(tokens.header);

        catalogAccess.invalidateCache();
        await savefileManager.initializeLocalSavefile();
        savefileMigrator.performStorageMigration();
    
        menu.create(this.mobileRoot.mainContainer);
        header.create(this.mobileRoot.headerContainer);
    
        const defaultMenuButtonManager = new DefaultMenuButtonManager(
            menu,
            () => navigateTo("/login"),
            async () => {
                await authService.logout();
                navigateTo("/");
            },
            () => navigateTo("/settings")
        );
    
        defaultMenuButtonManager.createDefaultMenuButtons(await authService.getCurrentUsername());
    
        header.onLogoClicked = () => navigateTo("/");
    
        router.run();
    }
}