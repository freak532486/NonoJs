import * as auth from "../../common/services/auth"
import Settings from "../../common/components/settings/index/settings.component"
import { Component } from "nonojs-common";
import tokens from "../../common/tokens";
import { navigateTo } from "../../common/services/navigate-to";
import SavefileAccess from "../../common/services/savefile/savefile-access";
import { SETTINGS_TITLE } from "../../common/titles";

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
            authService
        );
        
        activeComponentManager.setActiveComponent(settings);
        document.title = SETTINGS_TITLE;
    }
    
}