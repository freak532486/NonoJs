import { CellKnowledge } from "./nonogram-types";

export class SerializedNonogram {

    
    constructor (
        public readonly id: string,
        public readonly rowHints: Array<Array<number>>,
        public readonly colHints: Array<Array<number>>
    ) {}
};