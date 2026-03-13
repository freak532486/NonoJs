import { Component } from "nonojs-common";
import tokens from "../common/tokens";
import DefaultMenuButtonManager from "./menu/button-managers/default-menu-button-manager";
import MobileRootComponent from "./root-component/mobile-root";
import { navigateTo } from "../common/services/navigate-to";
import SavefileAccess from "../common/services/savefile/savefile-access";
import SavefileManager from "../common/services/savefile/savefile-manager";
import AuthService from "../common/services/auth/auth-service";

export default class AppInitializer extends Component
{

    private savefileManager: SavefileManager;

    constructor(
        private readonly authService: AuthService,
        private readonly savefileAccess: SavefileAccess,
        private readonly mobileRoot: MobileRootComponent
    ) {
        super();
        this.savefileManager = new SavefileManager(authService, savefileAccess);
    }

    async initApp() {
        const catalogAccess = this.ctx.getComponent(tokens.catalogAccess);
        const savefileMigrator = this.ctx.getComponent(tokens.savefileMigrator);
        const authService = this.ctx.getComponent(tokens.authService);
        const menu = this.ctx.getComponent(tokens.menu);
        const header = this.ctx.getComponent(tokens.header);

        catalogAccess.invalidateCache();
        await this.savefileManager.initializeLocalSavefile();
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
    }
}