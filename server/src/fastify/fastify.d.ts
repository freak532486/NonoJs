import "fastify";
import { Config } from "../config/impl/config-access";
import { Database } from "sqlite";
import { TokenStore } from "../auth/impl/login";

declare module "fastify" {
    interface FastifyInstance {
        state: {
            config: Config;
            db: Database;
            tokenStore: TokenStore;
        };
    }
}