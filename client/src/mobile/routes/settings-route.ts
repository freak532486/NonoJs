import Route from "../../common/services/routing/route";
import * as auth from "../../common/services/auth"
import Settings from "../settings/index/settings.component";
import { Component } from "nonojs-common";
import tokens from "../../common/tokens";
import { navigateTo } from "../../common/services/navigate-to";

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
                navigateTo("/");
            },
            async () => {
                await auth.deleteUser();
                navigateTo("/");
            }
        );
        
        activeComponentManager.setActiveComponent(settings);
        document.title = "NonoJs · Settings";
    }
    
}