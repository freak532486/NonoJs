import { SavefileUtils } from "../../common/services/savefile/savefile-utils";
import { PlayfieldComponent } from "../playfield/playfield.component";
import PlayfieldMenuButtonManager from "../menu/button-managers/playfield-menu-button-manager";
import { deduceAll } from "../../common/services/solver/solver";
import { DeductionStatus, NonogramState } from "../../common/types/nonogram-types";
import { navigateTo } from "../../common/services/navigate-to";
import SavefileAccess from "../../common/services/savefile/savefile-access";
import SavefileSyncService from "../../common/services/savefile/savefile-sync-service";
import { PLAYFIELD_TITLE } from "../../common/titles";
import { CatalogAccess } from "../../common/services/catalog/catalog-access";
import AuthService from "../../common/services/auth/auth-service";
import NotFoundPageInitializer from "./not-found-route";
import ActiveComponentManager from "../active-component-manager";
import { Menu } from "../menu/menu.component";
import { ListUtils } from "../../common/services/list-utils";

export default class NonogramPageInitializer 
{

    private readonly savefileSyncService: SavefileSyncService;

    constructor(
        private readonly activeComponentManager: ActiveComponentManager,
        private readonly savefileAccess: SavefileAccess,
        private readonly catalogAccess: CatalogAccess,
        private readonly authService: AuthService,
        private readonly menu: Menu
    )
    {
        this.savefileSyncService = new SavefileSyncService(authService, savefileAccess, catalogAccess);
    }

    async run(nonogramId: string): Promise<void> {
        const notFoundRoute = new NotFoundPageInitializer(this.activeComponentManager);
    
        /* Load requested nonogram */
        const nonogram = (await this.catalogAccess.getAllNonograms()).find(x => x.id == nonogramId);
        if (!nonogram) {
            notFoundRoute.run();
            return;
        }
    
        /* Load current state */
        const savefile = await this.savefileAccess.fetchLocalSavefile();
        var stored = savefile ? SavefileUtils.getSavestateForNonogram(savefile, nonogramId) : undefined;

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
            stored == undefined ? undefined : SavefileUtils.calculateAllStates(
                nonogram.colHints.length,
                nonogram.rowHints.length,
                stored.history
            ).map(x => new NonogramState(nonogram.rowHints, nonogram.colHints, x)),
            stored?.elapsed
        );
    
        /* Create playfield menu buttons */
        const playfieldButtonManager = new PlayfieldMenuButtonManager(
            this.menu,
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
                    ListUtils.addIfNotExists(saveFile.activeNonogramIds, playfield.nonogramId);
                } else {
                    ListUtils.remove(saveFile.activeNonogramIds, playfield.nonogramId);
                }
        
                await this.savefileAccess.writeLocalSavefile(saveFile);
        
                /* Queue sync */
                const activeUsername = await this.authService.getCurrentUsername();
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
        this.activeComponentManager.setActiveComponent(playfield);
    }

    /**
     * Stores the current state of the playfield to the local savefile.
     */
    async #storePlayfieldStateToStorage(playfield: PlayfieldComponent) {
        const savefile = await this.savefileAccess.fetchLocalSavefile();

        const history = SavefileUtils.getSavestateHistory(
            playfield.history
                .map(x => new NonogramState(playfield.rowHints, playfield.colHints, x.cells))
        );
        
        SavefileUtils.putSavestate(
            savefile,
            playfield.nonogramId,
            {
                history: history,
                elapsed: playfield.elapsed
            }
        );

        this.savefileAccess.writeLocalSavefile(savefile);
    }
    
}