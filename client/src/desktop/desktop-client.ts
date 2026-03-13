import AuthService from "../common/services/auth/auth-service";
import { CatalogAccess } from "../common/services/catalog/catalog-access";
import { navigateTo } from "../common/services/navigate-to";
import SavefileAccess from "../common/services/savefile/savefile-access";
import SavefileManager from "../common/services/savefile/savefile-manager";
import NonojsClient from "../common/types/nonojs-client";
import Header from "./header/header.component";
import NonogramPage from "./nonogram-page/nonogram-page.component";
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
        this.savefileAccess = new SavefileAccess(this.authService);
        this.catalogAccess = new CatalogAccess();
    
        this.root = new DesktopRoot();
        this.root.create(document.body);
    
        const header = new Header();
        header.create(this.root.headerContainer);
    }

    async init(): Promise<void> {
        await new SavefileManager(this.authService, this.savefileAccess).initializeLocalSavefile();
    }

    async openStartPage(): Promise<void> {
        const startPage = new StartPage(
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
            this.savefileAccess
        );
        await nonogramPage.create(this.root.mainContainer);
    }

    openCatalog(): Promise<void> {
        return this.openStartPage();
    }

    openSettings(): Promise<void> {
        throw new Error("Method not implemented.");
    }

    openLogin(): Promise<void> {
        return this.openStartPage();
    }

    confirmRegistration(token: string): Promise<void> {
        throw new Error("Method not implemented.");
    }

    openNotFoundPage(): Promise<void> {
        throw new Error("Method not implemented.");
    }
    
}