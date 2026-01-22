import { DatabaseAccess } from "./database-access";
import { FastifyBaseLogger } from "fastify";
import { AuthTableCreation } from "./migrations/auth-table-creation";

export interface DatabaseMigration {

    /**
     * Returns the identifier for this migration. This is used to skip it if it already ran.
     */
    get identifier(): string;

    /**
     * Runs the migration. This should always be executed within a transaction.
     */
    run(): Promise<void>;

}

export class DatabaseMigrator {

    readonly #logger;
    readonly #dbAccess;

    constructor (logger: FastifyBaseLogger, dbAccess: DatabaseAccess) {
        this.#logger = logger;
        this.#dbAccess = dbAccess;
    }


    /**
     * Performs all necessary database migrations.
     */
    async performMigrations(): Promise<void> {
        /* Create list of all migrations */
        const migrations: Array<DatabaseMigration> = [
            new AuthTableCreation(this.#dbAccess)
        ];

        /* Run each migration */
        for (const migration of migrations) {
            await this.#dbAccess.performInTransaction(async () => {
                await this.#runMigration(migration);
            });
        }
    }

    async #runMigration(migration: DatabaseMigration) {
        /* Check if migration has already been executed */
        const checkResult = await this.#dbAccess.run(
            "SELECT id FROM migration_history WHERE id = ?", 
            migration.identifier
        );

        if (checkResult.length > 0) {
            return; // Migration has already run.
        }

        /* Perform migration */
        this.#logger.info("Performing database migration '" + migration.identifier + "'");
        await migration.run();

        /* Write history entry */
        this.#dbAccess.run("INSERT INTO migration_history VALUES (?)", migration.identifier);
    }

};