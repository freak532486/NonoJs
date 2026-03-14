import * as auth from "../../common/services/auth"
import Settings from "../settings/index/settings.component";
import { Component } from "nonojs-common";
import tokens from "../../common/tokens";
import { navigateTo } from "../../common/services/navigate-to";
import SavefileAccess from "../../common/services/savefile/savefile-access";

export default class SettingsRoute extends Component
{

    constructor(
        private readonly savefileAccess: SavefileAccess
    )
    {
        super();
    }

    async run() {
        const authService = this.ctx.getComponent(tokens.authService);
        const savefileMerger = this.ctx.getComponent(tokens.savefileMerger);
        const activeComponentManager = this.ctx.getComponent(tokens.activeComponentManager);

        let settings = new Settings(
            this.savefileAccess,
            authService,
            async () => {
                const result = await savefileMerger.mergeLocalSavefileWithAccount();

                if (result == "ok") {
                    navigateTo("/");
                } else if (result == "error") {
                    alert("Error merging your savefile with the server.");
                } else if (result == "not_logged_in") {
                    throw new Error("User was not logged in.");
                }
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