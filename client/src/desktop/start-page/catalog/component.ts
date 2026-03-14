import template from "./template.html"
import "./style.css"
import UIComponent from "../../../common/types/ui-component";
import { htmlToElement } from "../../../common/services/html-to-element";
import { CatalogAccess } from "../../../common/services/catalog/catalog-access";
import { SerializedNonogram } from "../../../common/types/storage-types";
import SavefileAccess from "../../../common/services/savefile/savefile-access";
import { getSavestateForNonogram } from "../../../common/services/savefile/savefile-utils";
import { SaveState } from "nonojs-common";
import { CellKnowledge } from "../../../common/types/nonogram-types";

export default class DesktopCatalogComponent implements UIComponent
{
    private view: HTMLElement;

    constructor(
        private readonly catalogAccess: CatalogAccess,
        private readonly savefileAccess: SavefileAccess,
        private readonly onNonogramSelected: (nonogramId: string) => void
    )
    {
        this.view = htmlToElement(template);
    }

    async create(parent: HTMLElement): Promise<HTMLElement> {
        await this.refreshCatalog();

        const refreshButton = this.view.querySelector("#btn-catalog-apply-filters") as HTMLButtonElement;
        refreshButton.onclick = () => this.refreshCatalog();

        parent.appendChild(this.view);
        return this.view;
    }

    cleanup(): void {
        // Nothing to do
    }

    private async refreshCatalog() {
        const tableRoot = this.view.querySelector(".table-root table") as HTMLTableElement;

        /* Remove all data rows from catalog */
        tableRoot.querySelectorAll(".content-row").forEach(x => x.remove());

        /* Create predicate from filter values */
        const idFilter = this.view.querySelector("#catalog-filter-id") as HTMLInputElement;
        const minWidthFilter = this.view.querySelector("#catalog-filter-min-width") as HTMLInputElement;
        const minHeightFilter = this.view.querySelector("#catalog-filter-min-height") as HTMLInputElement;
        const maxWidthFilter = this.view.querySelector("#catalog-filter-max-width") as HTMLInputElement;
        const maxHeightFilter = this.view.querySelector("#catalog-filter-max-height") as HTMLInputElement;

        const minWidth = minWidthFilter.value == "" ? Number.NaN : Number(minWidthFilter.value);
        const maxWidth = maxWidthFilter.value == "" ? Number.NaN : Number(maxWidthFilter.value);
        const minHeight = minHeightFilter.value == "" ? Number.NaN :  Number(minHeightFilter.value);
        const maxHeight = maxHeightFilter.value == "" ? Number.NaN :  Number(maxHeightFilter.value);

        const predicate = (nono: SerializedNonogram) => {
            const idFilterMatch = nono.id.startsWith(idFilter.value);
            const minWidthFilterMatch = Number.isNaN(minWidth) ? true : nono.colHints.length >= minWidth;
            const maxWidthFilterMatch = Number.isNaN(maxWidth) ? true : nono.colHints.length <= maxWidth;
            const minHeightFilterMatch = Number.isNaN(minHeight) ? true : nono.rowHints.length >= minHeight;
            const maxHeightFilterMatch = Number.isNaN(maxHeight) ? true : nono.rowHints.length <= maxHeight;

            return idFilterMatch &&
                minWidthFilterMatch &&
                maxWidthFilterMatch &&
                minHeightFilterMatch &&
                maxHeightFilterMatch;
        }

        /* Fetch matching nonograms */
        const allNonograms = await this.catalogAccess.getAllNonograms();
        const matchingNonograms = allNonograms.filter(predicate);

        /* Sort by size */
        matchingNonograms.sort((a, b) => {
            if (a.colHints.length <= b.colHints.length) {
                return -1;
            }

            if (a.rowHints.length <= b.rowHints.length) {
                return -1;
            }

            return 1;
        })

        /* Create new entries from matching nonograms */
        const savefile = await this.savefileAccess.fetchLocalSavefile();
        for (const nono of matchingNonograms) {
            const savestate = getSavestateForNonogram(savefile, nono.id);
            const progress = savestate ? getProgress(savestate) : 0;

            const idVal = "#" + nono.id.substring(0, 6);
            const sizeVal = nono.colHints.length + "x" + nono.rowHints.length;
            const progressVal = Math.floor(100 * progress) + "%";

            const row = document.createElement("tr");
            row.classList.add("content-row");

            const idCell = document.createElement("td");
            idCell.textContent = idVal;
            row.appendChild(idCell);

            const sizeCell = document.createElement("td");
            sizeCell.textContent = sizeVal;
            row.appendChild(sizeCell);

            const progressCell = document.createElement("td");
            progressCell.textContent = progressVal;
            row.appendChild(progressCell);

            row.onclick = () => this.onNonogramSelected(nono.id);

            tableRoot.appendChild(row);
        }
    }
    
}

function getProgress(savestate: SaveState): number {
    return savestate.cells.filter(x => x !== CellKnowledge.UNKNOWN).length / savestate.cells.length;
}