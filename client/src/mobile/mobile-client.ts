import { Context } from "nonojs-common";
import NonojsClient from "../common/types/nonojs-client";
import MobileRootComponent from "./root-component/mobile-root";
import AuthService from "../common/services/auth/auth-service";
import tokens from "../common/tokens";
import { CatalogAccess } from "../common/services/catalog/catalog-access";
import SavefileAccess from "../common/services/savefile/savefile-access";
import SavefileManager from "../common/services/savefile/savefile-manager";
import SavefileMigrator from "../common/services/savefile/savefile-migrator";
import SavefileMerger from "../common/services/savefile/savefile-merger";
import SavefileSyncService from "../common/services/savefile/savefile-sync-service";
import ActiveComponentManager from "./active-component-manager";
import { Menu } from "./menu/menu.component";
import { Header } from "./header/header.component";
import NotFoundPageInitializer from "./page-initializers/not-found-route";
import CatalogPageInitializer from "./page-initializers/catalog";
import ConfirmRegistrationPageInitializer from "./page-initializers/confirm-registration";
import LoginPageInitializer from "./page-initializers/login-route";
import NonogramPageInitializer from "./page-initializers/nonogram";
import SettingsRoute from "./page-initializers/settings-route";
import StartpageRoute from "./page-initializers/startpage-route";
import AppInitializer from "./app-initializer";

export default class MobileClient implements NonojsClient
{

    private readonly ctx: Context;

    constructor() {
        /* Create injection context */
        const ctx = new Context();

        /* Create root container for mobile */
        const mobileRoot = new MobileRootComponent();
        mobileRoot.create(document.body);

        /* Add basic services */
        const authService = ctx.addComponent(tokens.authService, new AuthService()) as AuthService;
        ctx.addComponent(tokens.catalogAccess, new CatalogAccess());
        const savefileAccess = new SavefileAccess(ctx.getComponent(tokens.authService));
        const savefileManager = new SavefileManager(authService, savefileAccess);
        ctx.addComponent(tokens.savefileMigrator, new SavefileMigrator(savefileAccess));
        ctx.addComponent(tokens.savefileMerger, new SavefileMerger(savefileAccess));
        const syncService = new SavefileSyncService(savefileAccess);
        ctx.addComponent(tokens.activeComponentManager, new ActiveComponentManager(mobileRoot));

        /* Add UI components */
        ctx.addComponent(tokens.menu, new Menu());
        ctx.addComponent(tokens.header, new Header());

        /* Create all routes */
        ctx.addComponent(tokens.notFoundRoute, new NotFoundPageInitializer());
        ctx.addComponent(tokens.catalogRoute, new CatalogPageInitializer(savefileAccess));
        ctx.addComponent(tokens.confirmRegistrationRoute, new ConfirmRegistrationPageInitializer());
        ctx.addComponent(tokens.loginRoute, new LoginPageInitializer());
        ctx.addComponent(tokens.nonogramRoute, new NonogramPageInitializer(savefileAccess));
        ctx.addComponent(tokens.settingsRoute, new SettingsRoute(savefileAccess));
        ctx.addComponent(tokens.startpageRoute, new StartpageRoute(savefileAccess));

        /* Initialize app */
        ctx.addComponent(tokens.appInitializer, new AppInitializer(authService, savefileAccess, mobileRoot)).initApp();
        this.ctx = ctx;
    }

    async init(): Promise<void> {
        // Nothing to do
    }

    openStartPage(): Promise<void> {
        return this.ctx.getComponent(tokens.startpageRoute).run();
    }

    openNonogram(nonogramId: string): Promise<void> {
        return this.ctx.getComponent(tokens.nonogramRoute).run(nonogramId);
    }

    openCatalog(): Promise<void> {
        return Promise.resolve(this.ctx.getComponent(tokens.catalogRoute).run());
    }

    openSettings(): Promise<void> {
        return this.ctx.getComponent(tokens.settingsRoute).run();
    }

    openLogin(): Promise<void> {
        return Promise.resolve(this.ctx.getComponent(tokens.loginRoute).run());
    }

    confirmRegistration(token: string): Promise<void> {
        return this.ctx.getComponent(tokens.confirmRegistrationRoute).run(token);
    }

    openNotFoundPage(): Promise<void> {
        return Promise.resolve(this.ctx.getComponent(tokens.notFoundRoute).run());
    }
    
}