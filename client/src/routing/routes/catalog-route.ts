import Route from "../route";
import * as app from "../../app"
import { Catalog } from "../../catalog/component/catalog.component";
import ActiveComponentManager from "../../active-component-manager";
import { CatalogAccess } from "../../catalog/catalog-access";
import SavefileAccess from "../../savefile/savefile-access";

export default class CatalogRoute implements Route
{
    constructor(
        private readonly activeComponentManager: ActiveComponentManager,
        private readonly catalogAccess: CatalogAccess,
        private readonly savefileAccess: SavefileAccess
    ) {}

    matches(path: string): boolean {
        return path == "/catalog";
    }

    run(path: string) {
        const catalog = new Catalog(this.catalogAccess, this.savefileAccess);
        catalog.onNonogramSelected = nonogramId => app.navigateTo("/n/" + nonogramId);
        this.activeComponentManager.setActiveComponent(catalog);
        document.title = "Looking at catalog";
    }
    
}