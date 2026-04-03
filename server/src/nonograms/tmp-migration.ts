import * as fs from "fs";
import { Nonogram } from "nonojs-common";
import { addNonogram } from "./nonograms";
import { FastifyInstance } from "fastify";

export default async function TMP_migrateNonogramJson(fastify: FastifyInstance)
{
    const joined = fs.readFileSync("C:/Users/Max/Desktop/joined.json", "utf-8");
    const parsed = JSON.parse(joined);

    const nonograms = parsed.nonograms as Array<Nonogram> // trust me bro

    for (const nonogram of nonograms) {
        await addNonogram(fastify, nonogram);
    }
}