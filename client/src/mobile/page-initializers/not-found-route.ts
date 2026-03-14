import Route from "../../common/services/routing/route";
import { NotFoundPage } from "../not-found-page/not-found-page";
import { Component } from "nonojs-common";
import tokens from "../../common/tokens";
import { NOT_FOUND_TITLE } from "../../common/titles";

export default class NotFoundPageInitializer extends Component
{

    run() {
        const activeComponentManager = this.ctx.getComponent(tokens.activeComponentManager);

        let notFoundPage = new NotFoundPage();
        activeComponentManager.setActiveComponent(notFoundPage);
        document.title = NOT_FOUND_TITLE;
    }
    
}