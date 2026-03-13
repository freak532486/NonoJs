import { Token } from "nonojs-common";
import AuthService from "./services/auth/auth-service";
import { CatalogAccess } from "./services/catalog/catalog-access";
import SavefileAccess from "./services/savefile/savefile-access";
import SavefileManager from "./services/savefile/savefile-manager";
import SavefileMigrator from "./services/savefile/savefile-migrator";
import SavefileMerger from "./services/savefile/savefile-merger";
import SavefileSyncService from "./services/savefile/savefile-sync-service";
import ActiveComponentManager from "../mobile/active-component-manager";
import CatalogPageInitializer from "../mobile/page-initializers/catalog";
import ConfirmRegistrationPageInitializer from "../mobile/page-initializers/confirm-registration";
import LoginPageInitializer from "../mobile/page-initializers/login-route";
import NonogramPageInitializer from "../mobile/page-initializers/nonogram";
import NotFoundPageInitializer from "../mobile/page-initializers/not-found-route";
import SettingsRoute from "../mobile/page-initializers/settings-route";
import StartpageRoute from "../mobile/page-initializers/startpage-route";
import { Menu } from "../mobile/menu/menu.component";
import { Header } from "../mobile/header/header.component";
import { Router } from "./services/routing/router";
import AppInitializer from "../mobile/app-initializer";

const tokens = Object.freeze({

    /* Application-wide components */
    "appInitializer": new Token<AppInitializer>("AppInitializer"),
    "authService": new Token<AuthService>("AuthService"),
    "catalogAccess": new Token<CatalogAccess>("CatalogAccess"),
    "savefileMigrator": new Token<SavefileMigrator>("SavefileMigrator"),
    "savefileMerger": new Token<SavefileMerger>("SavefileMerger"),
    "activeComponentManager": new Token<ActiveComponentManager>("ActiveComponentManager"),

    /* Routes */
    "router": new Token<Router>("Router"),
    "catalogRoute": new Token<CatalogPageInitializer>("CatalogRoute"),
    "confirmRegistrationRoute": new Token<ConfirmRegistrationPageInitializer>("ConfirmRegistrationRoute"),
    "loginRoute": new Token<LoginPageInitializer>("LoginRoute"),
    "nonogramRoute": new Token<NonogramPageInitializer>("NonogramRoute"),
    "notFoundRoute": new Token<NotFoundPageInitializer>("NotFoundRoute"),
    "settingsRoute": new Token<SettingsRoute>("SettingsRoute"),
    "startpageRoute": new Token<StartpageRoute>("StartpageRoute"),

    /* UI Components */
    "menu": new Token<Menu>("Menu"),
    "header": new Token<Header>("Header"),

});

export default tokens;