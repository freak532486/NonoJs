import Route from "../route";
import * as app from "../../app"
import { Catalog } from "../../catalog/component/catalog.component";
import { Component } from "nonojs-common";
import tokens from "../../tokens";

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
        catalog.onNonogramSelected = nonogramId => app.navigateTo("/n/" + nonogramId);
        activeComponentManager.setActiveComponent(catalog);
        document.title = "Looking at catalog";
    }
    
}