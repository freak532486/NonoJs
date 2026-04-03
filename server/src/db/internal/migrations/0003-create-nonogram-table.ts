import { FastifyInstance } from "fastify";
import database from "../../database";

export default async function createNonogramTable(fastify: FastifyInstance): Promise<void>
{
    /* Get database from server instance */
    const db = fastify.state.db;

    /* Create table */
    const sql = `
        CREATE TABLE nonograms (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nonogram_id TEXT UNIQUE NOT NULL,
            width INTEGER NOT NULL,
            height INTEGER NOT NULL,
            submitted_by INTEGER,
            json TEXT NOT NULL,
            FOREIGN KEY (submitted_by) REFERENCES users(id) ON DELETE CASCADE
        )
    `;

    await database.runSql(db, sql);
}