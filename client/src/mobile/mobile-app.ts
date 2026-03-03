import { CatalogAccess } from "../common/services/catalog/catalog-access";
import { Header } from "./header/header.component";
import { Menu } from "./menu/menu.component";
import { Router } from "../common/services/routing/router";
import SavefileMigrator from "../common/services/savefile/savefile-migrator"
import SavefileAccess from "../common/services/savefile/savefile-access";
import SavefileManager from "../common/services/savefile/savefile-manager";
import SavefileMerger from "../common/services/savefile/savefile-merger";
import SavefileSyncService from "../common/services/savefile/savefile-sync-service";
import CatalogRoute from "./routes/catalog-route";
import ConfirmRegistrationRoute from "./routes/confirm-registration-route";
import LoginRoute from "./routes/login-route";
import NonogramRoute from "./routes/nonogram-route";
import SettingsRoute from "./routes/settings-route";
import StartpageRoute from "./routes/startpage-route";
import ActiveComponentManager from "./active-component-manager";
import NotFoundRoute from "./routes/not-found-route";
import { Context } from "nonojs-common";
import tokens from "../common/tokens";
import AuthService from "../common/services/auth/auth-service";
import AppInitializer from "./app-initializer";
import MobileRootComponent from "./root-component/mobile-root";

/**
 * Creates the mobile version of nonojs.
 */
export function launchMobileApp() {
    /* Create injection context */
    const ctx = new Context();

    /* Create root container for mobile */
    const mobileRoot = new MobileRootComponent();
    mobileRoot.create(document.body);

    /* Add basic services */
    ctx.addComponent(tokens.authService, new AuthService());
    ctx.addComponent(tokens.catalogAccess, new CatalogAccess());
    const savefileAccess = new SavefileAccess(ctx.getComponent(tokens.authService));
    ctx.addComponent(tokens.savefileManager, new SavefileManager(savefileAccess));
    ctx.addComponent(tokens.savefileMigrator, new SavefileMigrator(savefileAccess));
    ctx.addComponent(tokens.savefileMerger, new SavefileMerger(savefileAccess));
    ctx.addComponent(tokens.savefileSyncService, new SavefileSyncService(savefileAccess));
    ctx.addComponent(tokens.activeComponentManager, new ActiveComponentManager(mobileRoot));

    /* Add UI components */
    ctx.addComponent(tokens.menu, new Menu());
    ctx.addComponent(tokens.header, new Header());

    /* Add router and routes */
    const router = ctx.addComponent(tokens.router, new Router());

    /* Create all routes */
    ctx.addComponent(tokens.notFoundRoute, new NotFoundRoute());
    router.addRoute(ctx.addComponent(tokens.catalogRoute, new CatalogRoute(savefileAccess)));
    router.addRoute(ctx.addComponent(tokens.confirmRegistrationRoute, new ConfirmRegistrationRoute()));
    router.addRoute(ctx.addComponent(tokens.loginRoute, new LoginRoute()));
    router.addRoute(ctx.addComponent(tokens.nonogramRoute, new NonogramRoute(savefileAccess)));
    router.addRoute(ctx.addComponent(tokens.settingsRoute, new SettingsRoute(savefileAccess)));
    router.addRoute(ctx.addComponent(tokens.startpageRoute, new StartpageRoute(savefileAccess)));

    /* Initialize app */
    ctx.addComponent(tokens.appInitializer, new AppInitializer(mobileRoot)).initApp();
}