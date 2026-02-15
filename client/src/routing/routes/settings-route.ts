import Route from "../route";
import * as app from "../../app"
import * as auth from "../../auth"
import Settings from "../../settings/index/settings.component";
import { Component } from "nonojs-common";
import tokens from "../../tokens";

export default class SettingsRoute extends Component implements Route
{

    matches(path: string): boolean {
        return path == "/settings";
    }

    async run(path: string) {
        const savefileAccess = this.ctx.getComponent(tokens.savefileAccess);
        const authService = this.ctx.getComponent(tokens.authService);
        const savefileMerger = this.ctx.getComponent(tokens.savefileMerger);
        const activeComponentManager = this.ctx.getComponent(tokens.activeComponentManager);

        let settings = new Settings(
            savefileAccess,
            authService,
            async () => {
                await savefileMerger.mergeLocalSavefileWithAccount();
                app.navigateTo("/");
            },
            async () => {
                await auth.deleteUser();
                app.navigateTo("/");
            }
        );
        
        activeComponentManager.setActiveComponent(settings);
        document.title = "NonoJs · Settings";
    }
    
}