import Type, { Static } from "typebox";

export const NonogramSchema = Type.Object({
    id: Type.String(),
    rowHints: Type.Array(Type.Array(Type.Number())),
    colHints: Type.Array(Type.Array(Type.Number()))
});

export type Nonogram = Static<typeof NonogramSchema>