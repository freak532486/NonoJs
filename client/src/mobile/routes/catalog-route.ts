import Route from "../../common/services/routing/route";
import { Catalog } from "../catalog/catalog.component";
import { Component } from "nonojs-common";
import tokens from "../../common/tokens";
import { navigateTo } from "../../common/services/navigate-to";

export default class CatalogRoute extends Component implements Route
{

    matches(path: string): boolean {
        return path == "/catalog";
    }

    run(path: string) {
        const catalogAccess = this.ctx.getComponent(tokens.catalogAccess);
        const savefileAccess = this.ctx.getComponent(tokens.savefileAccess);
        const activeComponentManager = this.ctx.getComponent(tokens.activeComponentManager);

        const catalog = new Catalog(catalogAccess, savefileAccess);
        catalog.onNonogramSelected = nonogramId => navigateTo("/n/" + nonogramId);
        activeComponentManager.setActiveComponent(catalog);
        document.title = "Looking at catalog";
    }
    
}