import { Catalog } from "../catalog/catalog.component";
import { navigateTo } from "../../common/services/navigate-to";
import SavefileAccess from "../../common/services/savefile/savefile-access";
import { CATALOG_TITLE } from "../../common/titles";
import ActiveComponentManager from "../active-component-manager";
import { CatalogAccess } from "../../common/services/catalog/catalog-access";

export default class CatalogPageInitializer
{

    constructor(
        private readonly savefileAccess: SavefileAccess,
        private readonly catalogAccess: CatalogAccess,
        private readonly activeComponentManager: ActiveComponentManager
    ) {}

    run() {
        const catalog = new Catalog(this.catalogAccess, this.savefileAccess);
        catalog.onNonogramSelected = nonogramId => navigateTo("/n/" + nonogramId);
        this.activeComponentManager.setActiveComponent(catalog);
        document.title = CATALOG_TITLE;
    }
    
}