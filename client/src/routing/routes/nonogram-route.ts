import Route from "../route";
import * as app from "../../app"
import { getSavestateForNonogram, putSavestate } from "../../savefile/savefile-utils";
import NotFoundRoute from "./not-found-route";
import { CatalogAccess } from "../../catalog/catalog-access";
import SavefileAccess from "../../savefile/savefile-access";
import { PlayfieldComponent } from "../../playfield/playfield.component";
import ActiveComponentManager from "../../active-component-manager";
import PlayfieldMenuButtonManager from "../../menu/button-managers/playfield-menu-button-manager";
import { Menu } from "../../menu/menu.component";
import SavefileSyncService from "../../savefile/savefile-sync-service";
import { Component } from "nonojs-common";
import tokens from "../../tokens";

export default class NonogramRoute extends Component implements Route
{

    matches(path: string): boolean {
        return path.startsWith("/n/")
    }

    async run(path: string): Promise<void> {
        const catalogAccess = this.ctx.getComponent(tokens.catalogAccess);
        const savefileAccess = this.ctx.getComponent(tokens.savefileAccess);
        const savefileSyncService = this.ctx.getComponent(tokens.savefileSyncService);
        const authService = this.ctx.getComponent(tokens.authService);
        const notFoundRoute = this.ctx.getComponent(tokens.notFoundRoute);
        const menu = this.ctx.getComponent(tokens.menu);
        const activeComponentManager = this.ctx.getComponent(tokens.activeComponentManager);

        const nonogramId = path.split("/")[2];
    
        /* Load requested nonogram */
        const nonogram = (await catalogAccess.getAllNonograms()).find(x => x.id == nonogramId);
        if (!nonogram) {
            notFoundRoute.run(path);
            return;
        }
    
        /* Load current state */
        const savefile = await savefileAccess.fetchLocalSavefile();
        var stored = savefile ? getSavestateForNonogram(savefile, nonogramId) : undefined;
    
        /* Create new playfield */
        const playfield = new PlayfieldComponent(
            nonogramId,
            nonogram.rowHints, nonogram.colHints,
            stored?.cells,
            stored?.elapsed
        );
    
        /* Create playfield menu buttons */
        new PlayfieldMenuButtonManager(
            menu,
            () => playfield.solverService.hint(),
            () => playfield.solverService.solveNext(),
            () => playfield.solverService.solveFull(),
            () => playfield.reset(),
            async () => {
                await this.#storePlayfieldStateToStorage(playfield);
                app.navigateTo("/");
            }
        ).createButtons();
    
        playfield.onStateChanged = async () => {
            /* Save state to local storage */
            this.#storePlayfieldStateToStorage(playfield);
    
            /* Update last played nonogram id */
            const saveFile = await savefileAccess.fetchLocalSavefile();
    
            if (!playfield.hasWon) {
                saveFile.lastPlayedNonogramId = playfield.nonogramId;
            } else {
                saveFile.lastPlayedNonogramId = undefined;
            }
    
            savefileAccess.writeLocalSavefile(saveFile);
    
            /* Queue sync */
            const activeUsername = await authService.getCurrentUsername();
            if (activeUsername) {
                savefileSyncService.queueSync();
            }
        }
    
        document.title = "Playing " + nonogram.colHints.length + "x" + nonogram.rowHints.length + " Nonogram"
        activeComponentManager.setActiveComponent(playfield);
    }

    /**
     * Stores the current state of the playfield to the local savefile.
     */
    async #storePlayfieldStateToStorage(playfield: PlayfieldComponent) {
        const savefileAccess = this.ctx.getComponent(tokens.savefileAccess);

        const curState = playfield.currentState;
        const savefile = await savefileAccess.fetchLocalSavefile();

        putSavestate(savefile, playfield.nonogramId, {
            cells: curState.cells,
            elapsed: playfield.elapsed
        });

        savefileAccess.writeLocalSavefile(savefile);
    }
    
}