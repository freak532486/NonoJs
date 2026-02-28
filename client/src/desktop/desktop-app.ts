import { CatalogAccess } from "../common/services/catalog/catalog-access";
import SavefileAccess from "../common/services/savefile/savefile-access";
import { StartPageNonogramSelector } from "../common/services/start-page/start-page-nonogram-selector";
import Header from "./header/header.component";
import DesktopRoot from "./root-component/desktop-root";
import StartPage from "./start-page/start-page.component";

export function launchDesktopApp()
{
    /* Basic services */
    const savefileAccess = new SavefileAccess();
    const catalogAccess = new CatalogAccess();
    const nonogramSelector = new StartPageNonogramSelector(catalogAccess, savefileAccess);

    const root = new DesktopRoot();
    root.create(document.body);

    const header = new Header();
    header.create(root.headerContainer);
    
    const startPage = new StartPage(catalogAccess, nonogramSelector);
    startPage.create(root.mainContainer);
}