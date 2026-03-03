import { Catalog } from "../catalog/catalog.component";
import { Component } from "nonojs-common";
import tokens from "../../common/tokens";
import { navigateTo } from "../../common/services/navigate-to";
import SavefileAccess from "../../common/services/savefile/savefile-access";

export default class CatalogPageInitializer extends Component
{

    constructor(
        private readonly savefileAccess: SavefileAccess
    )
    {
        super();
    }

    run() {
        const catalogAccess = this.ctx.getComponent(tokens.catalogAccess);
        const activeComponentManager = this.ctx.getComponent(tokens.activeComponentManager);

        const catalog = new Catalog(catalogAccess, this.savefileAccess);
        catalog.onNonogramSelected = nonogramId => navigateTo("/n/" + nonogramId);
        activeComponentManager.setActiveComponent(catalog);
        document.title = "Looking at catalog";
    }
    
}