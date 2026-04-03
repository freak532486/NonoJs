import template from "./template.html"
import "./style.css"
import UIComponent from "../../types/ui-component";
import { htmlToElement } from "../../services/html-to-element";
import { CatalogAccess } from "../../services/catalog/catalog-access";
import SavefileAccess from "../../services/savefile/savefile-access";
import { SaveFile } from "nonojs-common";
import { getSavestateForNonogram, removeSavestate } from "../../services/savefile/savefile-utils";
import { CellKnowledge } from "../../types/nonogram-types";
import { SerializedNonogram } from "../../types/storage-types";

type NonogramStatus = "blank" | "started" | "solved";

export default class QuickplayComponent implements UIComponent
{
    private view: HTMLElement;

    constructor(
        private readonly savefileAccess: SavefileAccess,
        private readonly catalogAccess: CatalogAccess,
        private readonly onNonogramSelected: (nonogramId: string) => void
    )
    {
        this.view = htmlToElement(template);

        /* Assign button functions */
        const btn10x10 = this.view.querySelector("#btn-10x10") as HTMLButtonElement;
        const btn15x15 = this.view.querySelector("#btn-15x15") as HTMLButtonElement;
        const btn20x20 = this.view.querySelector("#btn-20x20") as HTMLButtonElement;
        const btn30x30 = this.view.querySelector("#btn-30x30") as HTMLButtonElement;
        const btn40x40 = this.view.querySelector("#btn-40x40") as HTMLButtonElement;
        const btnLarge = this.view.querySelector("#btn-large") as HTMLButtonElement;

        btn10x10.onclick = () => this.selectRandomNonogram(0, 0, 10, 10);
        btn15x15.onclick = () => this.selectRandomNonogram(10, 10, 15, 15);
        btn20x20.onclick = () => this.selectRandomNonogram(15, 15, 20, 20);
        btn30x30.onclick = () => this.selectRandomNonogram(20, 20, 30, 30);
        btn40x40.onclick = () => this.selectRandomNonogram(30, 30, 40, 40);
        btnLarge.onclick = () => this.selectRandomNonogram(40, 40, 1000, 1000);
    }

    create(parent: HTMLElement): HTMLElement {
        parent.appendChild(this.view);
        return this.view;
    }

    private async selectRandomNonogram(minWidth: number, minHeight: number, maxWidth: number, maxHeight: number) {
        const savefile = await this.savefileAccess.fetchLocalSavefile();

        const possibleNonograms = (await this.catalogAccess.getAllNonograms())
            .filter(nonogram => 
                nonogram.colHints.length > minWidth &&
                nonogram.colHints.length <= maxWidth &&
                nonogram.rowHints.length > minHeight &&
                nonogram.rowHints.length <= maxHeight
            );

        if (possibleNonograms.length == 0) {
            throw new Error("No nonogram available for quickplay.");
        }

        /* Partition by blank, started and solved */
        const partitionedNonograms = new Map<NonogramStatus, Array<SerializedNonogram>>();
        partitionedNonograms.set("blank", []);
        partitionedNonograms.set("started", []);
        partitionedNonograms.set("solved", []);

        for (const nonogram of possibleNonograms) {
            partitionedNonograms.get(getNonogramStatus(savefile, nonogram.id))!.push(nonogram);
        }

        /* Prefer blank nonograms, then started nonograms, and only then solved nonograms */
        const listKeyToChooseFrom: NonogramStatus = partitionedNonograms.get("blank")!.length > 0 ?
            "blank" :
            partitionedNonograms.get("started")!.length > 0 ? 
                "started" :
                "solved";
        const listToChooseFrom = partitionedNonograms.get(listKeyToChooseFrom)!;

        const r = Math.floor(Math.random() * listToChooseFrom.length);

        /* If the chosen nonogram was a solved nonogram, then the savestate should be cleared */
        const chosenNonogramId = listToChooseFrom[r].id;
        if (listKeyToChooseFrom == "solved") {
            removeSavestate(savefile, chosenNonogramId);
            await this.savefileAccess.writeLocalSavefile(savefile);
            await this.savefileAccess.writeServerSavefile(savefile);
        }

        this.onNonogramSelected(chosenNonogramId);
    }

    cleanup(): void {
        // Nothing to do
    }
}



function getNonogramStatus(savefile: SaveFile, nonogramId: string): NonogramStatus
{
    const savestate = getSavestateForNonogram(savefile, nonogramId);
    if (savestate == undefined) {
        return "blank";
    }

    const numFilledCells = savestate.cells
        .map(x => x == CellKnowledge.UNKNOWN ? 0 : 1)
        .map(x => x as number)
        .reduce((a, b) => a + b, 0);

    return numFilledCells == savestate.cells.length ? "solved" : "started";
}