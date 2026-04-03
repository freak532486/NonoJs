import Type, { Static } from "typebox";
import { NonogramSchema } from "./nonogram.js";

export const GetNonogramsResponseSchema = Type.Object({
    nonograms: Type.Array(NonogramSchema)
});

export type GetNonogramsResponse = Static<typeof GetNonogramsResponseSchema>