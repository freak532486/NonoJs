import { FastifyInstance } from "fastify";
import { Nonogram } from "nonojs-common";
import database from "../db/database";

export async function addNonogram(
    fastify: FastifyInstance,
    nonogram: Nonogram,
    userId?: number
)
{
    /* Impose limits on nonogram size */
    if (
        nonogram.rowHints.length < 5 ||
        nonogram.rowHints.length > 100 ||
        nonogram.colHints.length < 5 ||
        nonogram.colHints.length > 100
    ) {
        throw new Error("Nonograms must have size between 5x5 and 100x100.");
    }

    if (
        nonogram.rowHints.length % 5 !== 0 ||
        nonogram.colHints.length % 5 !== 0
    ) {
        throw new Error("Nonogram size must be divisible by five.");
    }

    /* Serialize */
    const json = JSON.stringify(nonogram);

    /* Write into database */
    const sql = `
        INSERT INTO nonograms(nonogram_id, width, height, submitted_by, json)
        VALUES ($nonogramId, $width, $height, $submittedBy, $json)
    `;

    await database.runSql(fastify.state.db, sql, {
        $nonogramId: nonogram.id,
        $width: nonogram.colHints.length,
        $height: nonogram.rowHints.length,
        $submittedBy: userId || null,
        $json: json
    });
}

export async function getAllNonograms(
    fastify: FastifyInstance,
    nonogramId?: string,
    minWidth?: number,
    minHeight?: number,
    maxWidth?: number,
    maxHeight?: number
): Promise<Array<Nonogram>>
{
    /* Load from database */
    const sql = `
        SELECT json FROM nonograms
        WHERE ($nonogramId IS NULL OR nonogram_id = $nonogramId)
        AND width >= $minWidth
        AND width < $maxWidth
        AND height >= $minHeight
        AND height < $maxHeight
        ORDER BY id
    `;

    const result = await database.runSql(fastify.state.db, sql, {
        $nonogramId: nonogramId ?? null,
        $minWidth: minWidth ?? 0,
        $maxWidth: maxWidth ?? 1000,
        $minHeight: minHeight ?? 0,
        $maxHeight: maxHeight ?? 1000
    });

    /* Build list from sql result */
    const ret: Array<Nonogram> = [];
    for (const res of result) {
        const parsed = parseNonogram(fastify, res.json);
        if (parsed !== undefined) {
            ret.push(parsed);
        }
    }

    /* Done */
    return ret;
}

function parseNonogram(fastify: FastifyInstance, json: string): Nonogram | undefined
{
    /* Try parsing, skip on JSON parse error */
    let parsed: any = undefined;
    try {
        parsed = JSON.parse(json);
    } catch (err) {
        return undefined;
    }

    /* Validate against schema */
    if (!fastify.state.validators.checkNonogramSchema(parsed)) {
        return undefined;
    }

    return parsed;
}