import * as app from "./app"
import { Component } from "nonojs-common";
import tokens from "./tokens";
import DefaultMenuButtonManager from "./menu/button-managers/default-menu-button-manager";

const contentRoot = document.getElementById("content-column") as HTMLElement;
const headerDiv = document.getElementById("header-div")  as HTMLElement;

export default class AppInitializer extends Component
{
    async initApp() {
        const catalogAccess = this.ctx.getComponent(tokens.catalogAccess);
        const savefileManager = this.ctx.getComponent(tokens.savefileManager);
        const savefileMigrator = this.ctx.getComponent(tokens.savefileMigrator);
        const authService = this.ctx.getComponent(tokens.authService);
        const router = this.ctx.getComponent(tokens.router);
        const menu = this.ctx.getComponent(tokens.menu);
        const header = this.ctx.getComponent(tokens.header);

        catalogAccess.invalidateCache();
        await savefileManager.initializeLocalSavefile();
        savefileMigrator.performStorageMigration();
    
        menu.create(contentRoot);
        header.create(headerDiv);
    
        const defaultMenuButtonManager = new DefaultMenuButtonManager(
            menu,
            () => app.navigateTo("/login"),
            async () => {
                await authService.logout();
                app.navigateTo("/");
            },
            () => app.navigateTo("/settings")
        );
    
        defaultMenuButtonManager.createDefaultMenuButtons(await authService.getCurrentUsername());
    
        header.onLogoClicked = () => app.navigateTo("/");
    
        router.run();
    }
}