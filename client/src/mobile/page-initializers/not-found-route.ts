import { NotFoundPage } from "../not-found-page/not-found-page";
import { NOT_FOUND_TITLE } from "../../common/titles";
import ActiveComponentManager from "../active-component-manager";

export default class NotFoundPageInitializer 
{

    constructor(
        private readonly activeComponentManager: ActiveComponentManager
    ) {}

    run() {
        let notFoundPage = new NotFoundPage();
        this.activeComponentManager.setActiveComponent(notFoundPage);
        document.title = NOT_FOUND_TITLE;
    }
    
}