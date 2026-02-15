import { CatalogAccess } from "./catalog/catalog-access";
import { Header } from "./header/header.component";
import { Menu } from "./menu/menu.component";
import { Router } from "./routing/router";
import SavefileMigrator from "./savefile/savefile-migrator"
import SavefileAccess from "./savefile/savefile-access";
import SavefileManager from "./savefile/savefile-manager";
import SavefileMerger from "./savefile/savefile-merger";
import SavefileSyncService from "./savefile/savefile-sync-service";
import CatalogRoute from "./routing/routes/catalog-route";
import ConfirmRegistrationRoute from "./routing/routes/confirm-registration-route";
import LoginRoute from "./routing/routes/login-route";
import NonogramRoute from "./routing/routes/nonogram-route";
import SettingsRoute from "./routing/routes/settings-route";
import StartpageRoute from "./routing/routes/startpage-route";
import ActiveComponentManager from "./active-component-manager";
import NotFoundRoute from "./routing/routes/not-found-route";
import { Context } from "nonojs-common";
import tokens from "./tokens";
import AuthService from "./auth/auth-service";
import AppInitializer from "./app-initializer";

/* Create injection context */
const ctx = new Context();

/* Add basic services */
ctx.addComponent(tokens.authService, new AuthService());
ctx.addComponent(tokens.catalogAccess, new CatalogAccess());
ctx.addComponent(tokens.savefileAccess, new SavefileAccess());
ctx.addComponent(tokens.savefileManager, new SavefileManager());
ctx.addComponent(tokens.savefileMigrator, new SavefileMigrator());
ctx.addComponent(tokens.savefileMerger, new SavefileMerger());
ctx.addComponent(tokens.savefileSyncService, new SavefileSyncService());
ctx.addComponent(tokens.activeComponentManager, new ActiveComponentManager());

/* Add UI components */
ctx.addComponent(tokens.menu, new Menu());
ctx.addComponent(tokens.header, new Header());

/* Add router and routes */
const router = ctx.addComponent(tokens.router, new Router());

/* Create all routes */
ctx.addComponent(tokens.notFoundRoute, new NotFoundRoute());
router.addRoute(ctx.addComponent(tokens.catalogRoute, new CatalogRoute()));
router.addRoute(ctx.addComponent(tokens.confirmRegistrationRoute, new ConfirmRegistrationRoute()));
router.addRoute(ctx.addComponent(tokens.loginRoute, new LoginRoute()));
router.addRoute(ctx.addComponent(tokens.nonogramRoute, new NonogramRoute()));
router.addRoute(ctx.addComponent(tokens.settingsRoute, new SettingsRoute()));
router.addRoute(ctx.addComponent(tokens.startpageRoute, new StartpageRoute()));

/* Initialize app */
ctx.addComponent(tokens.appInitializer, new AppInitializer()).initApp();

export function navigateTo(path: string) {
    window.location.replace(path);
}