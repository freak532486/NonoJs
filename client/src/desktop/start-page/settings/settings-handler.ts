import Settings from "../../../common/components/settings/index/settings.component";
import AuthService from "../../../common/services/auth/auth-service";
import { CatalogAccess } from "../../../common/services/catalog/catalog-access";
import SavefileAccess from "../../../common/services/savefile/savefile-access";
import Color from "../../../common/types/color";
import DesktopRoot from "../../root-component/desktop-root";

export default class DesktopStartpageSettingsHandler {

    constructor(
        private readonly savefileAccess: SavefileAccess,
        private readonly authService: AuthService,
        private readonly catalogAccess: CatalogAccess,
        private readonly root: DesktopRoot
    )
    {}

    showSettings()
    {
        const settingsComponent = new Settings(this.savefileAccess, this.authService, this.catalogAccess)
        const popupContent = this.root.showPopup("Settings", Color.YELLOW);
        settingsComponent.create(popupContent);
    }

}