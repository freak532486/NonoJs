import AuthService from "../common/services/auth/auth-service";
import { CatalogAccess } from "../common/services/catalog/catalog-access";
import { navigateTo } from "../common/services/navigate-to";
import SavefileAccess from "../common/services/savefile/savefile-access";
import { DEFAULT_TITLE, NOT_FOUND_TITLE } from "../common/titles";
import NonojsClient from "../common/types/nonojs-client";
import DesktopConfirmRegistrationPage from "./confirm-registration/component";
import Header from "./header/header.component";
import NonogramPage from "./nonogram-page/nonogram-page.component";
import DesktopNotFoundPage from "./not-found/component";
import DesktopRoot from "./root-component/desktop-root";
import StartPage from "./start-page/start-page.component";

export default class DesktopClient implements NonojsClient
{

    private readonly authService: AuthService;
    private readonly savefileAccess: SavefileAccess;
    private readonly catalogAccess: CatalogAccess;
    private readonly root: DesktopRoot;

    constructor() {
        /* Basic services */
        this.authService = new AuthService();
        this.catalogAccess = new CatalogAccess();
        this.savefileAccess = new SavefileAccess(this.authService, this.catalogAccess);
    
        this.root = new DesktopRoot();
        this.root.create(document.body);
    
        const header = new Header();
        header.create(this.root.headerContainer);
    }

    async init(): Promise<void> {
        // Nothing to do
    }

    async openStartPage(): Promise<void> {
        document.title = DEFAULT_TITLE;
        const startPage = new StartPage(
            this.root,
            this.authService,
            this.catalogAccess,
            this.savefileAccess,
            nonogramId => navigateTo("/n/" + nonogramId)
        );
        await startPage.create(this.root.mainContainer);
    }

    async openNonogram(nonogramId: string): Promise<void> {
        const nonogramPage = new NonogramPage(
            nonogramId,
            this.catalogAccess,
            this.savefileAccess,
            this.authService,
            this.root
        );
        await nonogramPage.create(this.root.mainContainer);
    }

    openCatalog(): Promise<void> {
        return this.openStartPage();
    }

    openSettings(): Promise<void> {
        return this.openStartPage();
    }

    openLogin(): Promise<void> {
        return this.openStartPage();
    }

    async confirmRegistration(token: string): Promise<void> {
        document.title = DEFAULT_TITLE;
        const confirmRegistrationPage = new DesktopConfirmRegistrationPage(token);
        await confirmRegistrationPage.create(this.root.mainContainer);
    }

    async openNotFoundPage(): Promise<void> {
        document.title = NOT_FOUND_TITLE;
        new DesktopNotFoundPage().create(this.root.mainContainer);
    }
    
}