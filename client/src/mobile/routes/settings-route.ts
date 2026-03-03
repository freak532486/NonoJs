import Route from "../../common/services/routing/route";
import * as auth from "../../common/services/auth"
import Settings from "../settings/index/settings.component";
import { Component } from "nonojs-common";
import tokens from "../../common/tokens";
import { navigateTo } from "../../common/services/navigate-to";
import SavefileAccess from "../../common/services/savefile/savefile-access";

export default class SettingsRoute extends Component implements Route
{

    constructor(
        private readonly savefileAccess: SavefileAccess
    )
    {
        super();
    }

    matches(path: string): boolean {
        return path == "/settings";
    }

    async run(path: string) {
        const authService = this.ctx.getComponent(tokens.authService);
        const savefileMerger = this.ctx.getComponent(tokens.savefileMerger);
        const activeComponentManager = this.ctx.getComponent(tokens.activeComponentManager);

        let settings = new Settings(
            this.savefileAccess,
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