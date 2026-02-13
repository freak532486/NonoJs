import { CatalogAccess } from "./catalog/catalog-access";
import { Header } from "./header/header.component";
import { Menu } from "./menu/menu.component";
import { Router } from "./routing/router";
import SavefileMigrator from "./savefile/savefile-migrator"
import RegistrationConfirmationManager from "./auth/services/confirm-registration";
import DefaultMenuButtonManager from "./menu/button-managers/default-menu-button-manager";
import SavefileAccess from "./savefile/savefile-access";
import SavefileManager from "./savefile/savefile-manager";
import MergeLocalSavefileWithAccount from "./savefile/merge-local-savefile-with-account";
import SavefileMerger from "./savefile/savefile-merger";
import SavefileSyncService from "./savefile/savefile-sync-service";
import * as auth from "./auth"
import CatalogRoute from "./routing/routes/catalog-route";
import ConfirmRegistrationRoute from "./routing/routes/confirm-registration-route";
import LoginRoute from "./routing/routes/login-route";
import NonogramRoute from "./routing/routes/nonogram-route";
import SettingsRoute from "./routing/routes/settings-route";
import StartpageRoute from "./routing/routes/startpage-route";
import ActiveComponentManager from "./active-component-manager";
import NotFoundRoute from "./routing/routes/not-found-route";

const contentRoot = document.getElementById("content-column") as HTMLElement;
const headerDiv = document.getElementById("header-div")  as HTMLElement;

/** If undefined, then the user is not logged in */
let activeUsername: string | undefined;

const catalogAccess = new CatalogAccess();
const savefileAccess = new SavefileAccess(msg => alert(msg), () => activeUsername);
const savefileManager = new SavefileManager(savefileAccess, () => activeUsername);
const savefileMigrator = new SavefileMigrator(savefileAccess);
const savefileMerger = new SavefileMerger();
const savefileSyncService = new SavefileSyncService(savefileAccess, savefileMerger);

const mergeLocalSavefileWithAccount = new MergeLocalSavefileWithAccount(
    savefileAccess,
    savefileMerger,
    () => activeUsername
);

const menu = new Menu();
const header = new Header(menu);

const activeComponentManager = new ActiveComponentManager();

/* Create all routes */
const notFoundRoute = new NotFoundRoute(activeComponentManager);
const routes = [
    new CatalogRoute(activeComponentManager, catalogAccess, savefileAccess),
    new ConfirmRegistrationRoute(activeComponentManager),
    new LoginRoute(activeComponentManager),
    new NonogramRoute(activeComponentManager, notFoundRoute, catalogAccess, savefileAccess, savefileSyncService, menu, () => activeUsername),
    new SettingsRoute(activeComponentManager, savefileAccess, () => activeUsername, mergeLocalSavefileWithAccount),
    new StartpageRoute(activeComponentManager, catalogAccess, savefileAccess, () => activeUsername)
];

let router = new Router(routes, notFoundRoute);

export async function init() {
    catalogAccess.invalidateCache();
    
    activeUsername = await auth.getCurrentUsername();
    await savefileManager.initializeLocalSavefile();
    savefileMigrator.performStorageMigration();

    menu.create(contentRoot);
    header.create(headerDiv);

    const defaultMenuButtonManager = new DefaultMenuButtonManager(
        menu,
        () => navigateTo("/login"),
        async () => {
            await auth.logout();
            navigateTo("/");
        },
        () => navigateTo("/settings")
    );

    defaultMenuButtonManager.createDefaultMenuButtons(activeUsername);

    header.onLogoClicked = () => navigateTo("/");

    router.run();
}

export function navigateTo(path: string) {
    window.location.replace(path);
}