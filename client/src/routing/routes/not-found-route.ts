import Route from "../route";
import ActiveComponentManager from "../../active-component-manager";
import { NotFoundPage } from "../../not-found-page/not-found-page";
import { Component } from "nonojs-common";
import tokens from "../../tokens";

export default class NotFoundRoute extends Component implements Route
{

    matches(path: string): boolean {
        return path == "/catalog";
    }

    run(path: string) {
        const activeComponentManager = this.ctx.getComponent(tokens.activeComponentManager);

        let notFoundPage = new NotFoundPage();
        activeComponentManager.setActiveComponent(notFoundPage);
        document.title = "404 Not Found";
    }
    
}