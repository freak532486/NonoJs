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

export default class NonogramRoute implements Route
{
    constructor(
        private readonly activeComponentManager: ActiveComponentManager,
        private readonly notFoundRoute: NotFoundRoute,
        private readonly catalogAccess: CatalogAccess,
        private readonly savefileAccess: SavefileAccess,
        private readonly savefileSyncService: SavefileSyncService,
        private readonly menu: Menu,
        private readonly getActiveUsername: () => string | undefined
    ) {}

    matches(path: string): boolean {
        return path.startsWith("/n/")
    }

    async run(path: string): Promise<void> {
        const nonogramId = path.split("/")[2];
    
        /* Load requested nonogram */
        const nonogram = (await this.catalogAccess.getAllNonograms()).find(x => x.id == nonogramId);
        if (!nonogram) {
            this.notFoundRoute.run(path);
            return;
        }
    
        /* Load current state */
        const savefile = this.savefileAccess.fetchLocalSavefile();
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
            this.menu,
            () => playfield.solverService.hint(),
            () => playfield.solverService.solveNext(),
            () => playfield.solverService.solveFull(),
            () => playfield.reset(),
            () => {
                this.#storePlayfieldStateToStorage(playfield);
                app.navigateTo("/");
            }
        ).createButtons();
    
        playfield.onStateChanged = () => {
            /* Save state to local storage */
            this.#storePlayfieldStateToStorage(playfield);
    
            /* Update last played nonogram id */
            const saveFile = this.savefileAccess.fetchLocalSavefile();
    
            if (!playfield.hasWon) {
                saveFile.lastPlayedNonogramId = playfield.nonogramId;
            } else {
                saveFile.lastPlayedNonogramId = undefined;
            }
    
            this.savefileAccess.writeLocalSavefile(saveFile);
    
            /* Queue sync */
            const activeUsername = this.getActiveUsername();
            if (activeUsername) {
                this.savefileSyncService.queueSync();
            }
        }
    
        document.title = "Playing " + nonogram.colHints.length + "x" + nonogram.rowHints.length + " Nonogram"
        this.activeComponentManager.setActiveComponent(playfield);
    }

    /**
     * Stores the current state of the playfield to the local savefile.
     */
    #storePlayfieldStateToStorage(playfield: PlayfieldComponent) {
        const curState = playfield.currentState;
        const savefile = this.savefileAccess.fetchLocalSavefile();

        putSavestate(savefile, playfield.nonogramId, {
            cells: curState.cells,
            elapsed: playfield.elapsed
        });

        this.savefileAccess.writeLocalSavefile(savefile);
    }
    
}