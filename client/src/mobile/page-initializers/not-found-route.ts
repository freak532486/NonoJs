import Route from "../../common/services/routing/route";
import { NotFoundPage } from "../not-found-page/not-found-page";
import { Component } from "nonojs-common";
import tokens from "../../common/tokens";

export default class NotFoundPageInitializer extends Component
{

    run() {
        const activeComponentManager = this.ctx.getComponent(tokens.activeComponentManager);

        let notFoundPage = new NotFoundPage();
        activeComponentManager.setActiveComponent(notFoundPage);
        document.title = "404 Not Found";
    }
    
}