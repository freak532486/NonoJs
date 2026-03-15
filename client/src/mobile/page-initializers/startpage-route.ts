import { StartPage } from "../start-page/component/start-page.component";
import { navigateTo } from "../../common/services/navigate-to";
import SavefileAccess from "../../common/services/savefile/savefile-access";
import { DEFAULT_TITLE } from "../../common/titles";
import AuthService from "../../common/services/auth/auth-service";
import { CatalogAccess } from "../../common/services/catalog/catalog-access";
import ActiveComponentManager from "../active-component-manager";

export default class StartpageRoute
{

    constructor(
        private readonly savefileAccess: SavefileAccess,
        private readonly authService: AuthService,
        private readonly catalogAccess: CatalogAccess,
        private readonly activeComponentManager: ActiveComponentManager
    ) {}

    async run() {
        let startPage = new StartPage(this.catalogAccess, this.savefileAccess);
        startPage.onNonogramSelected = nonogramId => navigateTo("/n/" + nonogramId);
        startPage.onLogin = () => navigateTo("/login");
        startPage.onOpenCatalog = () => navigateTo("/catalog");
        startPage.onOpenSettings = () => navigateTo("/settings");
        startPage.setLoggedInUsername(await this.authService.getCurrentUsername());

        this.activeComponentManager.setActiveComponent(startPage);
        document.title = DEFAULT_TITLE;
    }
    
}