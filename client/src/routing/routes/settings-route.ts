import Route from "../route";
import * as app from "../../app"
import * as auth from "../../auth"
import Settings from "../../settings/index/settings.component";
import SavefileAccess from "../../savefile/savefile-access";
import MergeLocalSavefileWithAccount from "../../savefile/merge-local-savefile-with-account";
import ActiveComponentManager from "../../active-component-manager";

export default class SettingsRoute implements Route
{

    constructor(
        private readonly activeComponentManager: ActiveComponentManager,
        private readonly savefileAccess: SavefileAccess,
        private readonly getActiveUsername: () => string | undefined,
        private readonly mergeLocalSavefileWithAccount: MergeLocalSavefileWithAccount
    ) {}

    matches(path: string): boolean {
        return path == "/settings";
    }

    run(path: string) {
        let settings = new Settings(
            this.savefileAccess,
            this.getActiveUsername,
            async () => {
                await this.mergeLocalSavefileWithAccount.perform();
                app.navigateTo("/");
            },
            async () => {
                await auth.deleteUser();
                app.navigateTo("/");
            }
        );
        
        this.activeComponentManager.setActiveComponent(settings);
        document.title = "NonoJs · Settings";
    }
    
}