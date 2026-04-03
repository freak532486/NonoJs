import { GetNonogramsResponse, Nonogram } from "nonojs-common";
import { performRequest } from "../api/api-client";

export class CatalogAccess {
    #cache?: Map<string, Nonogram>;

    async getAllNonograms(): Promise<Array<Nonogram>> {
        if (this.#cache) {
            return Array.from(this.#cache.values());
        }

        const request = new Request("/api/nonograms/", {
            method: "GET"
        });

        const response = await performRequest(request);
        if (response.status !== "ok") {
            throw new Error("Failed to retrieve nonograms from server");
        }

        const responseBody = (await response.data.json()) as GetNonogramsResponse;
        
        /* Fill cache */
        const cache = new Map();
        responseBody.nonograms.forEach(x => cache.set(x.id, x));
        this.#cache = cache;

        return responseBody.nonograms;
    }

    /**
     * Loads the nonogram with the given id. Returns undefined if no such nonogram exists.
     */
    async getNonogram(nonogramId: string): Promise<Nonogram | undefined> {
        /* Fill cache if this hasn't happened yet */
        if (!this.#cache) {
            await this.getAllNonograms();
        }

        return this.#cache!.get(nonogramId);
    }

    invalidateCache() {
        this.#cache = undefined;
    }
}