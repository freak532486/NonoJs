import tokens from "../../tokens";
import NonojsClient from "../../types/nonojs-client";
import Route from "./route";
import CatalogRoute from "./routes/catalog-route";
import ConfirmRegistrationRoute from "./routes/confirm-registration-route";
import LoginRoute from "./routes/login-route";
import NonogramRoute from "./routes/nonogram-route";
import SettingsRoute from "./routes/settings-route";
import StartpageRoute from "./routes/startpage-route";

export class Router
{

    private readonly routes: Array<Route> = [
        new CatalogRoute(),
        new ConfirmRegistrationRoute(),
        new LoginRoute(),
        new NonogramRoute(),
        new SettingsRoute(),
        new StartpageRoute()
    ];

    constructor(
        private readonly client: NonojsClient
    ) {}

    /**
     * Performs routing logic.
     */
    async run() {
        const path = window.location.pathname;
        
        for (const route of this.routes) {
            if (route.matches(path)) {
                route.run(this.client);
                return;
            }
        }
        
        this.client.openNotFoundPage();
    }
}