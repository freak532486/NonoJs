import { getSavestateForNonogram, putSavestate } from "../../common/services/savefile/savefile-utils";
import { PlayfieldComponent } from "../playfield/playfield.component";
import PlayfieldMenuButtonManager from "../menu/button-managers/playfield-menu-button-manager";
import { Component } from "nonojs-common";
import tokens from "../../common/tokens";
import { deduceAll } from "../../common/services/solver/solver";
import { DeductionStatus, NonogramState } from "../../common/types/nonogram-types";
import { navigateTo } from "../../common/services/navigate-to";
import SavefileAccess from "../../common/services/savefile/savefile-access";
import SavefileSyncService from "../../common/services/savefile/savefile-sync-service";
import { PLAYFIELD_TITLE } from "../../common/titles";

export default class NonogramPageInitializer extends Component
{

    private readonly savefileSyncService: SavefileSyncService;

    constructor(
        private readonly savefileAccess: SavefileAccess,
    )
    {
        super();
        this.savefileSyncService = new SavefileSyncService(savefileAccess);
    }

    async run(nonogramId: string): Promise<void> {
        const catalogAccess = this.ctx.getComponent(tokens.catalogAccess);
        const authService = this.ctx.getComponent(tokens.authService);
        const notFoundRoute = this.ctx.getComponent(tokens.notFoundRoute);
        const menu = this.ctx.getComponent(tokens.menu);
        const activeComponentManager = this.ctx.getComponent(tokens.activeComponentManager);
    
        /* Load requested nonogram */
        const nonogram = (await catalogAccess.getAllNonograms()).find(x => x.id == nonogramId);
        if (!nonogram) {
            notFoundRoute.run();
            return;
        }
    
        /* Load current state */
        const savefile = await this.savefileAccess.fetchLocalSavefile();
        var stored = savefile ? getSavestateForNonogram(savefile, nonogramId) : undefined;

        /* Presolve the nonogram */
        const solution = deduceAll(NonogramState.empty(nonogram.rowHints, nonogram.colHints));
        if (solution.status == DeductionStatus.WAS_IMPOSSIBLE) {
            window.alert("This nonogram was determined impossible by our solver.");
        } else if (solution.status !== DeductionStatus.WAS_SOLVED) {
            window.alert("This nonogram was not solveable by our solver. Good luck!");
        }
    
        /* Create new playfield */
        const playfield = new PlayfieldComponent(
            nonogramId,
            nonogram.rowHints, nonogram.colHints,
            solution.newState,
            stored?.cells,
            stored?.elapsed
        );
    
        /* Create playfield menu buttons */
        const playfieldButtonManager = new PlayfieldMenuButtonManager(
            menu,
            () => playfield.solverService.hint(),
            () => playfield.solverService.solveNext(),
            () => playfield.solverService.solveFull(),
            () => playfield.reset(),
            () => playfield.resetToLastValidState(),
            async () => {
                await this.#storePlayfieldStateToStorage(playfield);
                navigateTo("/");
            }
        );
        playfieldButtonManager.createButtons();
    
        /* Add listener for saving to savefile */
        playfield.addListener({
            onCellsChanged: async () => {
                /* Save state to local storage */
                await this.#storePlayfieldStateToStorage(playfield);
        
                /* Update last played nonogram id */
                const saveFile = await this.savefileAccess.fetchLocalSavefile();
        
                if (!playfield.hasWon) {
                    saveFile.lastPlayedNonogramId = playfield.nonogramId;
                } else {
                    saveFile.lastPlayedNonogramId = undefined;
                }
        
                await this.savefileAccess.writeLocalSavefile(saveFile);
        
                /* Queue sync */
                const activeUsername = await authService.getCurrentUsername();
                if (activeUsername) {
                    this.savefileSyncService.queueSync();
                }
            }
        });

        /* Add listener for hiding reset to valid state button */
        const updateResetToValidButtonVisibility = () => {
            playfieldButtonManager.setResetToValidButtonVisibility(
                playfield.hasUnsolveableLines() &&
                playfield.historyHasValidState()
            );
        }

        playfield.addListener({
            onCellsChanged: updateResetToValidButtonVisibility
        });
        updateResetToValidButtonVisibility();
    
        /* Finish */
        document.title = PLAYFIELD_TITLE(nonogram.colHints.length, nonogram.rowHints.length);
        activeComponentManager.setActiveComponent(playfield);
    }

    /**
     * Stores the current state of the playfield to the local savefile.
     */
    async #storePlayfieldStateToStorage(playfield: PlayfieldComponent) {
        const curState = playfield.currentState;
        const savefile = await this.savefileAccess.fetchLocalSavefile();

        putSavestate(savefile, playfield.nonogramId, {
            cells: curState.cells,
            elapsed: playfield.elapsed
        });

        this.savefileAccess.writeLocalSavefile(savefile);
    }
    
}