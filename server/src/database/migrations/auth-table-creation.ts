import { DatabaseAccess } from "../database-access";
import { DatabaseMigration } from "../database-migrator";

export class AuthTableCreation implements DatabaseMigration {

    readonly #dbAccess;

    constructor (dbAccess: DatabaseAccess) {
        this.#dbAccess = dbAccess;
    }

    get identifier(): string {
        return "AuthTableCreation";
    }

    async run(): Promise<void> {
        /* Create user table */
        const userTableSql = `
            CREATE TABLE users (
	            id INTEGER PRIMARY KEY AUTOINCREMENT,
                username TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL
            )
        `;

        await this.#dbAccess.run(userTableSql);

        /* Create session table */
        const userSessionSql = `
        CREATE TABLE user_sessions (
            user_id INTEGER PRIMARY KEY,
            refresh_token TEXT NOT NULL,
            refresh_token_created INTEGER NOT NULL,
            FOREIGN KEY(user_id) REFERENCES users(id)
        )
        `

        await this.#dbAccess.run(userSessionSql);
    }
    
}