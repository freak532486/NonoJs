import DefaultMenuButtonManager from "./menu/button-managers/default-menu-button-manager";
import MobileRootComponent from "./root-component/mobile-root";
import { navigateTo } from "../common/services/navigate-to";
import SavefileAccess from "../common/services/savefile/savefile-access";
import SavefileManager from "../common/services/savefile/savefile-manager";
import AuthService from "../common/services/auth/auth-service";
import { CatalogAccess } from "../common/services/catalog/catalog-access";
import SavefileMigrator from "../common/services/savefile/savefile-migrator";
import { Menu } from "./menu/menu.component";
import { Header } from "./header/header.component";

export default class AppInitializer
{

    private savefileManager: SavefileManager;
    private savefileMigrator: SavefileMigrator;

    constructor(
        private readonly authService: AuthService,
        private readonly catalogAccess: CatalogAccess,
        private readonly savefileAccess: SavefileAccess,
        private readonly mobileRoot: MobileRootComponent,
        private readonly menu: Menu,
        private readonly header: Header
    ) {
        this.savefileManager = new SavefileManager(authService, savefileAccess, catalogAccess);
        this.savefileMigrator = new SavefileMigrator(savefileAccess);
    }

    async initApp() {
        this.catalogAccess.invalidateCache();
        await this.savefileManager.initializeLocalSavefile();
        await this.savefileMigrator.performStorageMigration();
    
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