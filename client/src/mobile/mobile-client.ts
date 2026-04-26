import NonojsClient from "../common/types/nonojs-client";
import MobileRootComponent from "./root-component/mobile-root";
import AuthService from "../common/services/auth/auth-service";
import { CatalogAccess } from "../common/services/catalog/catalog-access";
import SavefileAccess from "../common/services/savefile/savefile-access";
import ActiveComponentManager from "./active-component-manager";
import { Menu } from "./menu/menu.component";
import { Header } from "./header/header.component";
import NotFoundPageInitializer from "./page-initializers/not-found-route";
import CatalogPageInitializer from "./page-initializers/catalog";
import ConfirmRegistrationPageInitializer from "./page-initializers/confirm-registration";
import LoginPageInitializer from "./page-initializers/login-route";
import NonogramPageInitializer from "./page-initializers/nonogram";
import SettingsRoute from "./page-initializers/settings-route";
import StartpageRoute from "./page-initializers/startpage-route";
import AppInitializer from "./app-initializer";

export default class MobileClient implements NonojsClient
{

    private readonly mobileRoot: MobileRootComponent;
    private readonly authService: AuthService;
    private readonly catalogAccess: CatalogAccess;
    private readonly savefileAccess: SavefileAccess;
    private readonly activeComponentManager: ActiveComponentManager;

    private readonly menu: Menu;
    private readonly header: Header;

    private readonly appInitializer: AppInitializer;

    constructor() {
        /* Create root container for mobile */
        this.mobileRoot = new MobileRootComponent();
        this.mobileRoot.create(document.body);

        /* Add basic services */
        this.authService = new AuthService();
        this.catalogAccess = new CatalogAccess();
        this.savefileAccess = new SavefileAccess(this.authService, this.catalogAccess);
        this.activeComponentManager = new ActiveComponentManager(this.mobileRoot);

        /* Initialize UI */
        this.menu = new Menu();
        this.header = new Header(this.menu);

        /* Initialize app */
        this.appInitializer = new AppInitializer(
            this.authService,
            this.catalogAccess,
            this.mobileRoot,
            this.menu,
            this.header
        );
    }

    async init(): Promise<void> {
        await this.appInitializer.initApp();
    }

    openStartPage(): Promise<void> {
        return new StartpageRoute(this.savefileAccess, this.authService, this.catalogAccess, this.activeComponentManager).run();
    }

    openNonogram(nonogramId: string): Promise<void> {
        return new NonogramPageInitializer(
            this.activeComponentManager,
            this.savefileAccess,
            this.catalogAccess,
            this.authService,
            this.menu
        ).run(nonogramId);
    }

    async openCatalog(): Promise<void> {
        return new CatalogPageInitializer(this.savefileAccess, this.catalogAccess, this.activeComponentManager).run();
    }

    openSettings(): Promise<void> {
        return new SettingsRoute(
            this.activeComponentManager,
            this.savefileAccess,
            this.authService,
            this.catalogAccess
        ).run();
    }

    async openLogin(): Promise<void> {
        return new LoginPageInitializer(this.activeComponentManager).run();
    }

    confirmRegistration(token: string): Promise<void> {
        return new ConfirmRegistrationPageInitializer(this.activeComponentManager).run(token);
    }

    async openNotFoundPage(): Promise<void> {
        return new NotFoundPageInitializer(this.activeComponentManager).run();
    }
    
}