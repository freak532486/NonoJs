import { Token } from "nonojs-common";
import AuthService from "./services/auth/auth-service";
import { CatalogAccess } from "./services/catalog/catalog-access";
import SavefileAccess from "./services/savefile/savefile-access";
import SavefileManager from "./services/savefile/savefile-manager";
import SavefileMigrator from "./services/savefile/savefile-migrator";
import SavefileMerger from "./services/savefile/savefile-merger";
import SavefileSyncService from "./services/savefile/savefile-sync-service";
import ActiveComponentManager from "../mobile/active-component-manager";
import CatalogRoute from "../mobile/routes/catalog-route";
import ConfirmRegistrationRoute from "../mobile/routes/confirm-registration-route";
import LoginRoute from "../mobile/routes/login-route";
import NonogramRoute from "../mobile/routes/nonogram-route";
import NotFoundRoute from "../mobile/routes/not-found-route";
import SettingsRoute from "../mobile/routes/settings-route";
import StartpageRoute from "../mobile/routes/startpage-route";
import { Menu } from "../mobile/menu/menu.component";
import { Header } from "../mobile/header/header.component";
import { Router } from "./services/routing/router";
import AppInitializer from "../mobile/app-initializer";

const tokens = Object.freeze({

    /* Application-wide components */
    "appInitializer": new Token<AppInitializer>("AppInitializer"),
    "authService": new Token<AuthService>("AuthService"),
    "catalogAccess": new Token<CatalogAccess>("CatalogAccess"),
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