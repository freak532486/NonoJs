import { Token } from "nonojs-common";
import AuthService from "./auth/auth-service";
import { CatalogAccess } from "./catalog/catalog-access";
import SavefileAccess from "./savefile/savefile-access";
import SavefileManager from "./savefile/savefile-manager";
import SavefileMigrator from "./savefile/savefile-migrator";
import SavefileMerger from "./savefile/savefile-merger";
import SavefileSyncService from "./savefile/savefile-sync-service";
import ActiveComponentManager from "./active-component-manager";
import CatalogRoute from "./routing/routes/catalog-route";
import ConfirmRegistrationRoute from "./routing/routes/confirm-registration-route";
import LoginRoute from "./routing/routes/login-route";
import NonogramRoute from "./routing/routes/nonogram-route";
import NotFoundRoute from "./routing/routes/not-found-route";
import SettingsRoute from "./routing/routes/settings-route";
import StartpageRoute from "./routing/routes/startpage-route";
import { Menu } from "./menu/menu.component";
import { Header } from "./header/header.component";
import { Router } from "./routing/router";
import AppInitializer from "./app-initializer";

const tokens = Object.freeze({

    /* Application-wide components */
    "appInitializer": new Token<AppInitializer>("AppInitializer"),
    "authService": new Token<AuthService>("AuthService"),
    "catalogAccess": new Token<CatalogAccess>("CatalogAccess"),
    "savefileAccess": new Token<SavefileAccess>("SavefileAccess"),
    "savefileManager": new Token<SavefileManager>("SavefileManager"),
    "savefileMigrator": new Token<SavefileMigrator>("SavefileMigrator"),
    "savefileMerger": new Token<SavefileMerger>("SavefileMerger"),
    "savefileSyncService": new Token<SavefileSyncService>("SavefileSyncService"),
    "activeComponentManager": new Token<ActiveComponentManager>("ActiveComponentManager"),

    /* Routes */
    "router": new Token<Router>("Router"),
    "catalogRoute": new Token<CatalogRoute>("CatalogRoute"),
    "confirmRegistrationRoute": new Token<ConfirmRegistrationRoute>("ConfirmRegistrationRoute"),
    "loginRoute": new Token<LoginRoute>("LoginRoute"),
    "nonogramRoute": new Token<NonogramRoute>("NonogramRoute"),
    "notFoundRoute": new Token<NotFoundRoute>("NotFoundRoute"),
    "settingsRoute": new Token<SettingsRoute>("SettingsRoute"),
    "startpageRoute": new Token<StartpageRoute>("StartpageRoute"),

    /* UI Components */
    "menu": new Token<Menu>("Menu"),
    "header": new Token<Header>("Header"),

});

export default tokens;