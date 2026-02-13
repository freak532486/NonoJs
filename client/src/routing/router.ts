import ActiveComponentManager from "../active-component-manager";
import * as app from "../app"
import Route from "./route";
import NotFoundRoute from "./routes/not-found-route";

export class Router
{
    constructor(
        private readonly routes: Array<Route>,
        private readonly notFoundRoute: NotFoundRoute
    ) {}

    /**
     * Performs routing logic.
     */
    async run() {
        const path = window.location.pathname;
        
        for (const route of this.routes) {
            if (route.matches(path)) {
                route.run(path);
                return;
            }
        }
        
        this.notFoundRoute.run(path);
    }
}