import DefaultMenuButtonManager from "./menu/button-managers/default-menu-button-manager";
import MobileRootComponent from "./root-component/mobile-root";
import { navigateTo } from "../common/services/navigate-to";
import SavefileAccess from "../common/services/savefile/savefile-access";
import AuthService from "../common/services/auth/auth-service";
import { CatalogAccess } from "../common/services/catalog/catalog-access";
import { Menu } from "./menu/menu.component";
import { Header } from "./header/header.component";

export default class AppInitializer
{

    constructor(
        private readonly authService: AuthService,
        private readonly catalogAccess: CatalogAccess,
        private readonly mobileRoot: MobileRootComponent,
        private readonly menu: Menu,
        private readonly header: Header
    ) {
    }

    async initApp() {
        this.catalogAccess.invalidateCache();
        
    
        this.menu.create(this.mobileRoot.mainContainer);
        this.header.create(this.mobileRoot.headerContainer);
    
        const defaultMenuButtonManager = new DefaultMenuButtonManager(
            this.menu,
            () => navigateTo("/login"),
            async () => {
                await this.authService.logout();
                navigateTo("/");
            },
            () => navigateTo("/settings")
        );
    
        defaultMenuButtonManager.createDefaultMenuButtons(await this.authService.getCurrentUsername());
    
        this.header.onLogoClicked = () => navigateTo("/");
    }
}