import Type, { Static } from "typebox";

/**
 * This is a delta object that stores the change from one state of a nonogram to the next. It is designed to be very
 * compact:
 * 
 * The list of changes is of the format '[COLOR CELL_ID COLOR_ID CELL COLOR_ID CELL_ID]', so first comes a color, 
 * then a cell id.
 * 
 * The color 0 is "unknown" (i.e. the user erased a cell). The color 1 could be white/cross and color 2 could be
 * black (for black and white nonograms, and could be the other way around).
 * 
 * The cell id is determined by the index of the cell in reading direction (i.e. starting from top-left, then going
 * right). For a cell position (x, y), the cell id is 'x + y * w', with 'w' being the nonogram width.
 * 
 */
export const SavestateHistoryDeltaSchema = Type.Object({
    changes: Type.Array(Type.Number())
});

export const SaveStateSchema = Type.Object({
    history: Type.Array(SavestateHistoryDeltaSchema),
    elapsed: Type.Number()
});

export const SaveFileEntrySchema = Type.Object({
    nonogramId: Type.String(),
    state: SaveStateSchema,
    lastModified: Type.Number()
});

export const SaveFileSchema = Type.Object({
    versionKey: Type.Number(),
    username: Type.Optional(Type.String()),
    activeNonogramIds: Type.Array(Type.String()),
    entries: Type.Array(SaveFileEntrySchema)
});

export type SaveFile = Static<typeof SaveFileSchema>
export type SaveFileEntry = Static<typeof SaveFileEntrySchema>
export type SaveState = Static<typeof SaveStateSchema>
export type SavestateHistoryDelta = Static<typeof SavestateHistoryDeltaSchema>


