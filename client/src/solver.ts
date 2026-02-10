import { CellKnowledge, DeductionStatus, FullDeductionResult, LineId, LineKnowledge, LineType, NonogramState, SingleDeductionResult } from "./common/nonogram-types.js"

const PRINT_XML = false;
const TIMEOUT_SECS = 5;


/**
 * Checks if the given state is solved.
 */
export function isSolved(state: NonogramState): boolean {
    /* Each row and hint must be solved, then the board is solved */
    const lines = [];
    for (let x = 0; x < state.width; x++) {
        lines.push(LineId.column(x));
    }

    for (let y = 0; y < state.height; y++) {
        lines.push(LineId.row(y));
    }

    return !lines.map(lineId => isLineSolved(state, lineId)).some(res => res == false);
}

/**
 * Returns true if the given line is solved in the given state.
 */
function isLineSolved(state: NonogramState, lineId: LineId): boolean {
    const lineKnowledge = state.getLineKnowledge(lineId);

    /* Each cell must be filled */
    if (lineKnowledge.cells.some(x => x == CellKnowledge.UNKNOWN)) {
        return false;
    }

    /* Line must be solveable */
    const hints = state.getLineHints(lineId);
    return leftmostSolution(lineKnowledge, hints) !== undefined;
}

/**
 * Performs a fullsolve.
 */
export function deduceAll(state: NonogramState): FullDeductionResult {
    /* For debugging, you can print as pbmsolver-xml */
    if (PRINT_XML) {
        printXml(state);
    }

    /* Create new state */
    const startTs = Date.now();
    const newState = NonogramState.clone(state);
    const keyFunc = getLineKeyFunction(state);

    /* Create list of all lines */
    let jobQueue = new PriorityQueue(keyFunc);

    for (let row = 0; row < state.height; row++) {
        jobQueue.push(LineDeductionJob.overlapDeduction(LineType.ROW, row));
        jobQueue.push(LineDeductionJob.exhaustiveDeduction(LineType.ROW, row));
    }

    for (let col = 0; col < state.width; col++) {
        jobQueue.push(LineDeductionJob.overlapDeduction(LineType.COLUMN, col));
        jobQueue.push(LineDeductionJob.exhaustiveDeduction(LineType.COLUMN, col));
    }

    /* Deduce until no job is left */
    while (jobQueue.size() > 0) {
        if (Date.now() - startTs > 1000 * TIMEOUT_SECS) {
            return { status: DeductionStatus.TIMEOUT, newState: newState };
        }

        const job = jobQueue.pop()!;
        const deduction = deduceLine(newState, job);

        /* Attempt exhaustive after overlap solving */
        if (job.mode == DeductionMode.OVERLAP) {
            jobQueue.push(LineDeductionJob.exhaustiveDeduction(job.lineId.lineType, job.lineId.index));
        }

        /* Skip on already-solved line */
        if (deduction.status == DeductionStatus.WAS_SOLVED || deduction.status == DeductionStatus.COULD_NOT_DEDUCE) {
            continue;
        }

        /* Quit on timeout or contradiction */
        if (deduction.status !== DeductionStatus.DEDUCTION_MADE) {
            return { status: deduction.status, newState: newState };
        }

        /* Add all changed perpendicular lines to lines to check */
        if (job.lineId.lineType == LineType.ROW) {
            const y = job.lineId.index;
            for (let x = 0; x < state.width; x++) {
                if (deduction.newKnowledge?.cells[x] == newState.getCell(x, y)) {
                    continue;
                }

                const colJob = LineDeductionJob.overlapDeduction(LineType.COLUMN, x);
                const oldJob = jobQueue.arr.find(job => job.lineId.equals(colJob.lineId));
                if (oldJob) {
                    jobQueue.remove(oldJob);
                }

                jobQueue.push(colJob);
            }
        } else {
            const x = job.lineId.index;
            for (let y = 0; y < state.height; y++) {
                if (deduction.newKnowledge?.cells[y] == newState.getCell(x, y)) {
                    continue;
                }

                const rowJob = LineDeductionJob.overlapDeduction(LineType.ROW, y);
                const oldJob = jobQueue.arr.find(job => job.lineId.equals(rowJob.lineId));
                if (oldJob) {
                    jobQueue.remove(oldJob);
                }

                jobQueue.push(rowJob);
            }
        }

        /* Apply deduction to state */
        const singleDeduction = new SingleDeductionResult(deduction.status, job.lineId, deduction.newKnowledge); 
        newState.applyDeduction(singleDeduction);
    }

    /* Jobs ran out. Check if all cells are filled. */
    const allSolved = !newState.cells.some(cell => cell == CellKnowledge.UNKNOWN);

    return new FullDeductionResult(
        allSolved ? DeductionStatus.WAS_SOLVED : 
                    DeductionStatus.COULD_NOT_DEDUCE,
        newState
    );
}

function printXml(state: NonogramState) {
    var xml = "";

    xml += "<puzzleset>\n";
    xml += "  <puzzle type=\"grid\" defaultcolor=\"black\">\n";
    xml += "    <id>#1</id>\n";
    xml += "    <color name=\"white\" char=\".\">fff</color>\n";
    xml += "    <color name=\"black\" char=\"#\">000</color>\n";
    xml += "\n";

    xml += "    <clues type=\"rows\">";
    for (const hints of state.rowHints) {
        xml += "<line>";
        for (const hint of hints) {
            xml += "<count>" + hint + "</count>";
        }
        xml += "</line>";
    }
    xml += "</clues>\n";

    xml += "    <clues type=\"columns\">";
    for (const hints of state.colHints) {
        xml += "<line>";
        for (const hint of hints) {
            xml += "<count>" + hint + "</count>";
        }
        xml += "</line>";
    }
    xml += "</clues>\n";

    xml += "  </puzzle>";
    xml += "</puzzleset>";

    console.log(xml);
}

/**
 * Based on the given input, performs the next possible deduction for the nonogram.
 */
export function deduceNext(state: NonogramState): SingleDeductionResult {
    /* Create list of all lines */
    const keyFunc = getLineKeyFunction(state);
    const lines = new PriorityQueue(keyFunc);

    for (let row = 0; row < state.height; row++) {
        const line = LineDeductionJob.overlapDeduction(LineType.ROW, row);
        lines.push(line);
    }

    for (let col = 0; col < state.width; col++) {
        const line = LineDeductionJob.overlapDeduction(LineType.COLUMN, col);
        lines.push(line);
    }

    let allSolved = true;
    while (lines.size() > 0) {
        const job = lines.pop()!;
        const deduction = deduceLine(state, job);
        allSolved = allSolved && deduction.status == DeductionStatus.WAS_SOLVED;

        /* Attempt exhaustive search if overlap solving fails */
        if (deduction.status == DeductionStatus.COULD_NOT_DEDUCE && job.mode == DeductionMode.OVERLAP) {
            lines.push(LineDeductionJob.exhaustiveDeduction(job.lineId.lineType, job.lineId.index));
        }

        /* Skip solved lines */
        if (deduction.status == DeductionStatus.WAS_SOLVED || deduction.status == DeductionStatus.COULD_NOT_DEDUCE) {
            continue;
        }

        /* Return on timeout, contradiction or deduced line. */
        return new SingleDeductionResult(deduction.status, job.lineId, deduction.newKnowledge);
    }

    return new SingleDeductionResult(
        allSolved ? DeductionStatus.WAS_SOLVED : 
                    DeductionStatus.COULD_NOT_DEDUCE, undefined, undefined
    );
}

export class HintCheckResult {
    
    constructor(
        public newKnowledge: LineKnowledge,
        public finishedHints: Array<number>
    ) {}
}

/**
 * Checks which hints in the given line are finished and can be crossed out. In addition to that, also deduces which
 * squares can definitely be crossed out because some hints are finished.
 * 
 * Returns undefined if the hints cannot be placed anymore. In that case, the line contains an error.
 */
export function checkHints(lineKnowledge: LineKnowledge, hints: Array<number>): HintCheckResult | undefined {
    const deduction = overlapLineDeduction(lineKnowledge, hints, false);

    /* Detect impossible configuration */
    if (!deduction.lineDeductionResult.newKnowledge) {
        return undefined;
    }

    /* Extra check: If all hints are finished, all unknown cells are white */
    if (deduction.finishedHints.length == hints.length) {
        const newKnowledge = deduction.lineDeductionResult.newKnowledge;
        for (let i = 0; i < newKnowledge.cells.length; i++) {
            if (newKnowledge.cells[i] == CellKnowledge.UNKNOWN) {
                newKnowledge.cells[i] = CellKnowledge.DEFINITELY_WHITE;
            }
        }
    }

    /* Extra check: If the first hint is finished, all previous cells are white */
    if (deduction.finishedHints.indexOf(0) !== -1) {
        let x = 0;
        while (lineKnowledge.cells[x] !== CellKnowledge.DEFINITELY_BLACK) {
            deduction.lineDeductionResult.newKnowledge.cells[x] = CellKnowledge.DEFINITELY_WHITE;
            x += 1;
        }
    }

    /* Extra check: If the last hint is finished, all next cells are white */
    if (deduction.finishedHints.indexOf(hints.length - 1) !== -1) {
        let x = lineKnowledge.cells.length - 1;
        while (lineKnowledge.cells[x] !== CellKnowledge.DEFINITELY_BLACK) {
            deduction.lineDeductionResult.newKnowledge.cells[x] = CellKnowledge.DEFINITELY_WHITE;
            x -= 1;
        }
    }

    /* Special case: Empty hints and empty line */
    if (hints.length == 0) {
        if (!lineKnowledge.cells.some(x => x != CellKnowledge.DEFINITELY_WHITE)) {
            deduction.finishedHints = [0];
        } else {
            deduction.lineDeductionResult.newKnowledge = lineKnowledge;
        }
    }

    /* Return */
    return new HintCheckResult(deduction.lineDeductionResult.newKnowledge, deduction.finishedHints);
}

/**
 * Returns the key function for sorting lines.
 */
function getLineKeyFunction(state: NonogramState): (line: LineDeductionJob) => number {
    /* Order by hint size and number of filled squares */
    /** @param {LineDeductionJob} line */
    return (line) => {
        const lineId = line.lineId;

        /* Exhaustive only after normal line deductions */
        const exhaustiveMalus = line.mode == DeductionMode.EXHAUSTIVE ? -1000 : 0;

        /* Prioritize lines on the edges */
        if (lineId.lineType == LineType.COLUMN) {
            return exhaustiveMalus + Math.abs(lineId.index - state.colHints.length / 2);
        } else {
            return exhaustiveMalus + Math.abs(lineId.index - state.rowHints.length / 2);
        }
    };
}

enum DeductionMode {
    OVERLAP,
    EXHAUSTIVE
};

/**
 * Performs a single line deduction.
 */
function deduceLine(state: NonogramState, job: LineDeductionJob): LineDeductionResult {
    const lineId = job.lineId;
    const mode = job.mode;

    const curKnowledge = state.getLineKnowledge(lineId);

    const hints = (lineId.lineType == LineType.ROW) ?
        state.rowHints[lineId.index] :
        state.colHints[lineId.index];

    switch (mode) {
        case DeductionMode.OVERLAP: return overlapLineDeduction(curKnowledge, hints).lineDeductionResult;
        case DeductionMode.EXHAUSTIVE: return exhaustiveLineDeduction(curKnowledge, hints);
        default: throw new Error("Unknown mode: " + mode);
    }
}

class LineDeductionResult {

    constructor(
        public status: DeductionStatus,
        public newKnowledge: LineKnowledge | undefined
    ) {}

}

class OverlapDeductionResult {

    constructor (
        public lineDeductionResult: LineDeductionResult,
        public finishedHints: Array<number>)
    {}

    static noDeduction(status: DeductionStatus): OverlapDeductionResult {
        return new OverlapDeductionResult(new LineDeductionResult(status, undefined), []);
    }
}

/**
 * Performs a deduction on a line by overlapping left- and rightmost solutions.
 * 
 * If deduceFull is false, overlap deduction is not done. It is only checked whether blocks of black cells finish a
 * hint. If yes, the finished hint is recorded and its neighbours are crossed out.
 */
function overlapLineDeduction(
    lineKnowledge: LineKnowledge,
    hints: Array<number>,
    deduceFull: boolean = true
): OverlapDeductionResult
{
    const lineLength = lineKnowledge.cells.length;
    const newKnowledge = new LineKnowledge([...lineKnowledge.cells]);
    const finishedHints = [];

    /* Get leftmost and rightmost solution */
    const lSol = leftmostSolution(lineKnowledge, hints);
    const rSol = rightmostSolution(lineKnowledge, hints);

    /* No solution found => Impossible */
    if (!lSol || !rSol) {
        return OverlapDeductionResult.noDeduction(DeductionStatus.WAS_IMPOSSIBLE);
    }

    /* Check each cell for hint or gap overlap */
    const xEnd = deduceFull ? lineLength : 0;
    for (let x = 0; x < xEnd; x++) {
        /* Calculate which block (hint or gap) overlays x */
        const lBlock = calcContainedBlock(x, hints, lSol);
        const rBlock = calcContainedBlock(x, hints, rSol);

        /*
         * If x is overlaid by the same hint in both solutions, it must be black.
         * If x is overlaid by the same  gap in both solutions, it must be white.
         */
        if (lBlock.isGap !== rBlock.isGap) {
            continue;
        }

        if (lBlock.hintIdx !== rBlock.hintIdx) {
            continue;
        }

        const newCellKnowledge = lBlock.isGap ? CellKnowledge.DEFINITELY_WHITE : CellKnowledge.DEFINITELY_BLACK;
        const oppositeCellKnowledge = lBlock.isGap ? CellKnowledge.DEFINITELY_BLACK : CellKnowledge.DEFINITELY_WHITE;

        if (lineKnowledge.cells[x] == oppositeCellKnowledge) {
            return OverlapDeductionResult.noDeduction(DeductionStatus.WAS_IMPOSSIBLE);
        }

        newKnowledge.cells[x] = newCellKnowledge;
    }

    /* Check if any black cell block must be a full hint, in that case isolate it with white cells */
    let blockLeft = /** @type {number | undefined} */ (undefined);
    for (let x = 0; x <= lineLength; x++) {
        /* Handle out of bounds by acting as if it were a white square */
        const state = x < lineLength ? newKnowledge.cells[x] : CellKnowledge.DEFINITELY_WHITE;

        /* On block start: Mark block start, move to end */
        if (state == CellKnowledge.DEFINITELY_BLACK) {
            if (blockLeft == undefined) {
                blockLeft = x;
            }

            continue;
        }

        /* On nonblack block: Just continue if this is not marking a block end */
        if (blockLeft == undefined) {
            continue;
        }

        /* x marks a block end. Find corresponding hints in left and right solution. */
        const lHintIdx = findLastPredecessorIdx(lSol, blockLeft);
        const rHintIdx = findLastPredecessorIdx(rSol, blockLeft);

        /* Check if all hints that can cover this block have the same length as the block. */
        const blockLength = x - blockLeft;
        let blockIsDone = true;
        for (let i = Math.min(lHintIdx, rHintIdx); i <= Math.max(lHintIdx, rHintIdx); i++) {
            if (hints[i] > blockLength) {
                blockIsDone = false;
                break;
            }
        }

        if (!blockIsDone) {
            blockLeft = undefined;
            continue;
        }

        /* Block is a full hint. Mark left and right of it as white. */
        if (blockLeft - 1 >= 0) {
            newKnowledge.cells[blockLeft - 1] = CellKnowledge.DEFINITELY_WHITE;
        }

        if (x < lineLength) {
            newKnowledge.cells[x] = CellKnowledge.DEFINITELY_WHITE;
        }

        /* If block is the same hint in leftmost and rightmost solution, that hint can be crossed out */
        if (lHintIdx == rHintIdx) {
            finishedHints.push(lHintIdx);
        }

        blockLeft = undefined;
    }

    /* Done */
    const res = deductionResult(lineKnowledge, newKnowledge);
    return new OverlapDeductionResult(res, finishedHints);
}

interface ContainedBlockResult {
    hintIdx: number,
    isGap: boolean
}


function calcContainedBlock(
    x: number,
    hints: Array<number>,
    solution: Array<number>
): ContainedBlockResult
{
    if (hints.length != solution.length) {
        throw new Error("Solution must have as many entries as there are hints");
    }

    const idx = findLastPredecessorIdx(solution, x);
    const isGap = idx == -1 || x >= solution[idx] + hints[idx];

    return { hintIdx: idx, isGap: isGap };
}

/**
 * For each unknown square: Marks that square black, then checks if there is a solution. If not, then that square must
 * be white.
 * 
 * Expensive, so only used after overlap deduction does not find anything anymore.
 */
function exhaustiveLineDeduction(
    lineKnowledge: LineKnowledge,
    hints: Array<number>
): LineDeductionResult
{
    const newKnowledge = new LineKnowledge([...lineKnowledge.cells]);
    const lineLength = lineKnowledge.cells.length;

    for (var x = 0; x < lineLength; x++) {
        if (lineKnowledge.cells[x] !== CellKnowledge.UNKNOWN) {
            continue;
        }

        /* Attempt black cell */
        newKnowledge.cells[x] = CellKnowledge.DEFINITELY_BLACK;
        const solBlack = leftmostSolution(newKnowledge, hints);

        /* If no solution found, cell must be white. */
        if (!solBlack) {
            newKnowledge.cells[x] = CellKnowledge.DEFINITELY_WHITE;
            continue;
        } else {
            newKnowledge.cells[x] = CellKnowledge.UNKNOWN;
        }

        /* Attempt white cell */
        newKnowledge.cells[x] = CellKnowledge.DEFINITELY_WHITE;
        const solWhite = leftmostSolution(newKnowledge, hints);

        /* If no solution found, cell must be black. */
        if (!solWhite) {
            newKnowledge.cells[x] = CellKnowledge.DEFINITELY_BLACK;
        } else {
            newKnowledge.cells[x] = CellKnowledge.UNKNOWN;
        }
    }

    /* Done */
    return deductionResult(lineKnowledge, newKnowledge);
}

/**
 * After a line deduction, returns the appropriate result based on the deduced new line state.
 */
function deductionResult(
    lineKnowledge: LineKnowledge,
    newKnowledge: LineKnowledge
): LineDeductionResult
{
    const lineLength = lineKnowledge.cells.length;
    let allSolved = true;
    let anyChanged = false;
    for (let x = 0; x < lineLength; x++) {
        allSolved = allSolved && newKnowledge.cells[x] != CellKnowledge.UNKNOWN;
        anyChanged = anyChanged || newKnowledge.cells[x] != lineKnowledge.cells[x];
    }

    /* Done */
    if (!anyChanged) {
        const status = allSolved ? DeductionStatus.WAS_SOLVED : DeductionStatus.COULD_NOT_DEDUCE;
        return new LineDeductionResult(status, newKnowledge);
    } else {
        return new LineDeductionResult(DeductionStatus.DEDUCTION_MADE, newKnowledge);
    }
}

/**
 * Finds the rightmost valid solution for the given line.
 * 
 * @param {LineKnowledge} lineKnowledge 
 * @param {Array<number>} hints
 * @returns {Array<number> | undefined}
 */
function rightmostSolution(
    lineKnowledge: LineKnowledge,
    hints: Array<number>
): Array<number> | undefined
{
    const lineLength = lineKnowledge.cells.length;

    /* Reverse line and simply use leftSol(...) */
    const reversedLine = new LineKnowledge([...lineKnowledge.cells].reverse());
    const reversedHints = [...hints].reverse();
    const reversedSolution = leftmostSolution(reversedLine, reversedHints);

    /* Just return if no solution */
    if (!reversedSolution) {
        return undefined;
    }

    /* Each number in the solution currently points to the leftmost cell in the _reversed_ view, we need to fix that */
    for (let i = 0; i < reversedSolution.length; i++) {
        reversedSolution[i] = lineLength - reversedSolution[i] - hints[hints.length - i - 1];
    }

    /* Create solution for original line */
    return reversedSolution.reverse();
}

/**
 * Finds the leftmost valid solution for the given line.
 */
function leftmostSolution(
    lineKnowledge: LineKnowledge,
    hints: Array<number>,
    lineIdx: number = 0,
    hintIdx: number = 0,
    memory: Map<string, Array<number> | undefined> = new Map()
) : Array<number> | undefined
{
    const memKey = lineIdx + "," + hintIdx;
    if (memory.has(memKey)) {
        return memory.get(memKey);
    }

    const lineLength = lineKnowledge.cells.length;
    const hint = hints[hintIdx];
    
    /* Base case: No hints */
    if (!hint) {
        for (let i = lineIdx; i < lineLength; i++) {
            if (lineKnowledge.cells[i] == CellKnowledge.DEFINITELY_BLACK) {
                memory.set(memKey, undefined);
                return undefined;
            }
        }
        
        memory.set(memKey, []);
        return [];
    }
    
    const numRemainingHints = hints.length - hintIdx;
    const remainingHintSum = hints.slice(hintIdx).reduce((a, b) => a + b, 0);
    const minHintTotal = remainingHintSum + numRemainingHints - 1;
    const maxHintX = lineLength - minHintTotal;
    
    /* Try every valid position of this hint, starting from left */
    for (let x = lineIdx; x <= maxHintX; x++) {
        /* Check validity of placement */
        let valid = true;
        for (let i = x; i < x + hint; i++) {
            /* Invalid if a hint cell is definitely white */
            if (i < lineLength && lineKnowledge.cells[i] == CellKnowledge.DEFINITELY_WHITE) {
                valid = false; break;
            }
        }
        
        /* Invalid if cell next to hint is definitely black */
        if (x + hint < lineLength && lineKnowledge.cells[x + hint] == CellKnowledge.DEFINITELY_BLACK) {
            valid = false;
        }
        
        /* Invalid if any cell before hint if definitely black */
        for (let i = x - 1; i >= lineIdx; i--) {
            if (lineKnowledge.cells[i] == CellKnowledge.DEFINITELY_BLACK) {
                valid = false;
            }
        }
        
        /* Skip invalid placements */
        if (!valid) {
            continue;
        }
        
        /* Find leftmost solution for remaining line */
        const remainingSolution = leftmostSolution(lineKnowledge, hints, x + hint + 1, hintIdx + 1, memory);
        if (!remainingSolution) {
            continue;
        }
        
        const finalSolution = [x];
        remainingSolution.forEach(pos => finalSolution.push(pos));
        memory.set(memKey, finalSolution);
        return finalSolution;
    }
    
    memory.set(memKey, undefined);
    return undefined;
}

/**
 * Returns the index of the last element in arr that is smaller than or equal to x. If x is smaller than all elements, 
 * returns -1.
 */
function findLastPredecessorIdx(arr: Array<number>, x: number): number {
    if (arr.length == 0 || arr[0] > x) {
        return -1;
    }

    for (let i = 0; i < arr.length - 1; i++) {
        if (arr[i + 1] > x) {
            return i;
        }
    }

    return arr.length - 1;
}

class LineDeductionJob {

    constructor(
        public readonly lineId: LineId,
        public readonly mode: DeductionMode)
    {}

    /**
     * Creates a new overlap deduction job.
     */
    static overlapDeduction(lineType: LineType, index: number): LineDeductionJob {
        return new LineDeductionJob(new LineId(lineType, index), DeductionMode.OVERLAP);
    }

    /**
     * Creates a new exhaustive deduction job.
     */
    static exhaustiveDeduction(lineType: LineType, index: number): LineDeductionJob {
        return new LineDeductionJob(new LineId(lineType, index), DeductionMode.EXHAUSTIVE);
    }
}

/**
 * Really shitty priority queue
 */
class PriorityQueue<T> {
    #arr: Array<PriorityQueueEntry<T>> = [];

    constructor(
        private readonly keyFunc: (val: T) => number
    ) {}

    /**
     * Adds an element to the queue.
     */
    push(value: T) {
        const key = this.keyFunc(value);
        let i = 0;
        
        /* Move to first entry with a larger key */
        while (i < this.#arr.length && this.#arr[i].key < key) {
            i += 1;
        }

        /* Insert there */
        const entry = { value: value, key: key };
        this.#arr.splice(i, 0, entry);
    }

    /**
     * Returns the element with the largest key from the queue.
     */
    pop(): T | undefined {
        return this.#arr.pop()?.value;
    }

    /**
     * Removes the given value from the queue.
     */
    remove(val: T) {
        /* Search for element */
        const idx = this.#arr.map(entry => entry.value).indexOf(val);

        /* Remove */
        if (idx !== -1) {
            this.#arr.splice(idx, 1);
        }
    }

    size(): number {
        return this.#arr.length;
    }

    get arr(): Array<T> {
        return this.#arr.map(entry => entry.value);
    }
}

interface PriorityQueueEntry<T> {
    key: number,
    value: T
}