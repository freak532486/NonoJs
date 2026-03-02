import { CellKnowledge, NonogramState } from "../../types/nonogram-types";
import UIComponent from "../../types/ui-component";

export default class NonogramThumbnail implements UIComponent
{

    public readonly view: HTMLCanvasElement;

    /**
     * Creates a thumbnail for the given nonogram. The cell size determines the size, in pixels, of a single cell.
     * Minimum size is 1.
     */
    constructor(
        private readonly nonogram: NonogramState,
        private readonly cellSize: number
    )
    {
        this.view = createThumbnailCanvas(nonogram, cellSize);
    }

    /**
     * Creates the largest possible thumbnail that fits into the given dimensions.
     */
    static forDimensions(nonogram: NonogramState, maxWidth: number, maxHeight: number)
    {
        return new NonogramThumbnail(nonogram, getCellSizeForDimensions(nonogram, maxWidth, maxHeight));
    }

    create(parent: HTMLElement): HTMLElement {
        parent.appendChild(this.view);
        return this.view;
    }
    cleanup(): void {
        // Nothing to do
    }
    
}

/**
 * Calculates the maximum cell size so that the thumbnail for the given nonogram fits into the given dimensions. 
 */
function getCellSizeForDimensions(
    nonogram: NonogramState,
    maxWidth: number,
    maxHeight: number,
)
{
    const maxNumRowhints = nonogram.rowHints.map(arr => arr.length).reduce((a, b) => a >= b ? a : b, 0);
    const maxNumColhints = nonogram.colHints.map(arr => arr.length).reduce((a, b) => a >= b ? a : b, 0);

    /*
     * Formula determined by solving 'maxWidth >= (cellSize + 1) * (nonogram.width + maxNumRowhints) + 2' for
     * 'cellSize'.
     */
    const hCellSize = (maxWidth - 2) / (maxNumRowhints + nonogram.width) - 1;
    const vCellSize = (maxHeight - 2) / (maxNumColhints + nonogram.height) - 1;

    return Math.max(1, Math.min(Math.floor(hCellSize), Math.floor(vCellSize)));
}

function createThumbnailCanvas(nonogram: NonogramState, cellSize: number): HTMLCanvasElement
{
    /* Calculate dimensions */
    const maxNumRowhints = nonogram.rowHints.map(arr => arr.length).reduce((a, b) => a >= b ? a : b, 0);
    const maxNumColhints = nonogram.colHints.map(arr => arr.length).reduce((a, b) => a >= b ? a : b, 0);

    const width = maxNumRowhints * (cellSize + 1) + nonogram.width * (cellSize + 1) + 2;
    const height = maxNumColhints * (cellSize + 1) + nonogram.height * (cellSize + 1) + 2;

    /* Create canvas */
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    ctx.lineWidth = 1;

    drawGrayGridLines(ctx, maxNumRowhints, nonogram.width, cellSize, height, true);
    drawGrayGridLines(ctx, maxNumColhints, nonogram.height, cellSize, width, false);
    fillTopLeftCorner(ctx, maxNumRowhints, maxNumColhints, cellSize);
    fillSquares(ctx, nonogram, cellSize);
    drawBlackGridLines(ctx, maxNumRowhints, nonogram.width, cellSize, height, true);
    drawBlackGridLines(ctx, maxNumColhints, nonogram.height, cellSize, width, false);

    /* Done */
    return canvas;
}

function drawBlackGridLines(
    ctx: CanvasRenderingContext2D,
    numHints: number,
    numCells: number,
    cellSize: number,
    lineLength: number,
    vertical: boolean
)
{
    const moveTo = (x: number, y: number) => vertical ? ctx.moveTo(x, y) : ctx.moveTo(y, x);
    const lineTo = (x: number, y: number) => vertical ? ctx.lineTo(x, y) : ctx.lineTo(y, x);

    /* Outer nonogram border */
    ctx.beginPath();
    ctx.strokeStyle = "#000000";
    moveTo(0.5, 0);
    lineTo(0.5, lineLength);
    ctx.stroke();

    /* Line between rowhints and cells */
    ctx.lineWidth = 2;
    const x = numHints * (cellSize + 1) + 1;
    ctx.beginPath();
    moveTo(x, 0);
    lineTo(x, lineLength);
    ctx.stroke();

    /* Black lines for cells */
    ctx.lineWidth = 1;
    for (let i = 0; i < numCells; i++) {
        if (i % 5 !== 4) {
            continue;
        }

        const x = (numHints + i) * (cellSize + 1) + cellSize + 2.5;
        ctx.beginPath();
        moveTo(x, 0);
        lineTo(x, lineLength);
        ctx.stroke();
    }
}

function drawGrayGridLines(
    ctx: CanvasRenderingContext2D,
    numHints: number,
    numCells: number,
    cellSize: number,
    lineLength: number,
    vertical: boolean
)
{
    const moveTo = (x: number, y: number) => vertical ? ctx.moveTo(x, y) : ctx.moveTo(y, x);
    const lineTo = (x: number, y: number) => vertical ? ctx.lineTo(x, y) : ctx.lineTo(y, x);
    
    /* Column hint lines */
    ctx.strokeStyle = "#CCCCCC";
    for (let i = 1; i < numHints; i++) {
        const x = 0.5 + (cellSize + 1) * i;
        ctx.beginPath();
        moveTo(x, 0);
        lineTo(x, lineLength);
        ctx.stroke();
    }

    /* Gray lines between cells */
    ctx.lineWidth = 1;
    for (let i = 0; i < numCells; i++) {
        if (i % 5 == 4) {
            continue;
        }

        const x = (numHints + i) * (cellSize + 1) + cellSize + 2.5;
        ctx.beginPath();
        moveTo(x, 0);
        lineTo(x, lineLength);
        ctx.stroke();
    }
}

function fillTopLeftCorner(
    ctx: CanvasRenderingContext2D,
    maxNumRowhints: number,
    maxNumColhints: number,
    cellSize: number
)
{
    ctx.clearRect(1, 1, maxNumRowhints * (cellSize + 1) - 1, maxNumColhints * (cellSize + 1) - 1);
}

function fillSquares(
    ctx: CanvasRenderingContext2D,
    nonogram: NonogramState,
    cellSize: number
)
{
    const maxNumRowhints = nonogram.rowHints.map(arr => arr.length).reduce((a, b) => a >= b ? a : b, 0);
    const maxNumColhints = nonogram.colHints.map(arr => arr.length).reduce((a, b) => a >= b ? a : b, 0);

    ctx.fillStyle = "#00000080";

    /* Row hint squares */
    for (let i = 0; i < nonogram.height; i++) {
        const right = (cellSize + 1) * maxNumRowhints;
        const left = right - (cellSize + 1) * nonogram.rowHints[i].length;
        const top = (cellSize + 1) * (maxNumColhints + i) + 2;
        const bottom = top + cellSize + 1;

        ctx.fillRect(left, top, right - left, bottom - top);
    }

    /* Column hint squares */
    for (let i = 0; i < nonogram.width; i++) {
        const bottom = (cellSize + 1) * maxNumColhints;
        const top = bottom - (cellSize + 1) * nonogram.colHints[i].length;
        const left = (cellSize + 1) * (maxNumRowhints + i) + 2;
        const right = left + cellSize + 1;

        ctx.fillRect(left, top, right - left, bottom - top);
    }

    /* Cells */
    ctx.fillStyle = "#000000"
    const cellsLeft = (cellSize + 1) * maxNumRowhints + 2;
    const cellsTop = (cellSize + 1) * maxNumColhints + 2;

    for (let y = 0; y < nonogram.height; y++) {
        for (let x = 0; x < nonogram.width; x++) {
            if (nonogram.getCell(x, y) !== CellKnowledge.DEFINITELY_BLACK) {
                continue;
            }

            ctx.fillRect(
                cellsLeft + (cellSize + 1) * x - 1,
                cellsTop + (cellSize + 1) * y - 1,
                cellSize + 2,
                cellSize + 2
            );
        }
    }
}