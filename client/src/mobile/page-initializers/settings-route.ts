import Settings from "../../common/components/settings/index/settings.component"
import AuthService from "../../common/services/auth/auth-service";
import { CatalogAccess } from "../../common/services/catalog/catalog-access";
import SavefileAccess from "../../common/services/savefile/savefile-access";
import SavefileMerger from "../../common/services/savefile/impl/savefile-merger";
import { SETTINGS_TITLE } from "../../common/titles";
import ActiveComponentManager from "../active-component-manager";

export default class SettingsRoute 
{

    private savefileMerger: SavefileMerger;

    constructor(
        private readonly activeComponentManager: ActiveComponentManager,
        private readonly savefileAccess: SavefileAccess,
        private readonly authService: AuthService,
        private readonly catalogAccess: CatalogAccess
    )
    {
        this.savefileMerger = new SavefileMerger(catalogAccess);
    }

    async run() {
        let settings = new Settings(
            this.savefileAccess,
            this.authService,
            this.catalogAccess
        );
        
        this.activeComponentManager.setActiveComponent(settings);
        document.title = SETTINGS_TITLE;
    }
    
}