import "source-map-support/register";
import { join } from 'node:path'
import AutoLoad, { AutoloadPluginOptions } from '@fastify/autoload'
import { FastifyPluginAsync, FastifyServerOptions } from 'fastify'
import database from "../db/database";
import TMP_migrateNonogramJson from "../nonograms/tmp-migration";

export interface AppOptions extends FastifyServerOptions, Partial<AutoloadPluginOptions> {

}
// Pass --options via CLI arguments in command to enable these options.
const options: AppOptions = {
}

const app: FastifyPluginAsync<AppOptions> = async (
  fastify,
  opts
): Promise<void> => {
    /* Register plugins */
    await fastify.register(AutoLoad, {
        dir: join(__dirname, 'plugins'),
        options: opts
    })

    /* Register routes */
    await fastify.register(AutoLoad, {
        dir: join(__dirname, 'routes'),
        options: opts
    })

    /* Run database migrations */
    await database.performDatabaseMigrations(fastify);

    /* Remove this after migration */
    await TMP_migrateNonogramJson(fastify);
}

export default app
export { app, options }
