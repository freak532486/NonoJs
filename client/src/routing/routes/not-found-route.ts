import Route from "../route";
import ActiveComponentManager from "../../active-component-manager";
import { NotFoundPage } from "../../not-found-page/not-found-page";

export default class NotFoundRoute implements Route
{
    constructor(
        private readonly activeComponentManager: ActiveComponentManager
    ) {}

    matches(path: string): boolean {
        return path == "/catalog";
    }

    run(path: string) {
        let notFoundPage = new NotFoundPage();
        this.activeComponentManager.setActiveComponent(notFoundPage);
        document.title = "404 Not Found";
    }
    
}