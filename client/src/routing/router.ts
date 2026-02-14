import { Component } from "nonojs-common";
import Route from "./route";
import NotFoundRoute from "./routes/not-found-route";
import tokens from "../tokens";

export class Router extends Component
{
    #routes: Array<Route> = [];

    addRoute(route: Route) {
        this.#routes.push(route);
    }

    /**
     * Performs routing logic.
     */
    async run() {
        const notFoundRoute = this.ctx.getComponent(tokens.notFoundRoute);
        const path = window.location.pathname;
        
        for (const route of this.#routes) {
            if (route.matches(path)) {
                route.run(path);
                return;
            }
        }
        
        notFoundRoute.run(path);
    }
}