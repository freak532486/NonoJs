import { Component, Context, SaveFile } from "nonojs-common";
import { ACTIVE_VERSION_KEY } from "./savefile-migrator";
import * as api from "../api/api-client"
import tokens from "../tokens";

const STORAGE_KEY = "storage";

export default class SavefileAccess extends Component
{

     /**
     * Fetches the savefile from local browser storage.
     */
    async fetchLocalSavefile(): Promise<SaveFile> {
        const authService = this.ctx.getComponent(tokens.authService);

        const username = await authService.getCurrentUsername();
        return this.fetchLocalSavefileForUser(username) || createEmptySavefile(username);
    }

    /**
     * Returns the locally stored save file for the given user. If the username is undefined, this represents the
     * savefile that was made while not logged in. 
     */
    fetchLocalSavefileForUser(username: string | undefined): SaveFile | undefined
    {
        const key = STORAGE_KEY + (username ? "_" + username : "");
        const serialized = window.localStorage.getItem(key);
        if (!serialized) {
            return undefined;
        }

        return JSON.parse(serialized);
    }

    /**
     * Removes the local savefile for the given user.
     */
    deleteLocalSavefileForUser(username: string | undefined)
    {
        const key = STORAGE_KEY + (username ? "_" + username : "");
        window.localStorage.removeItem(key);
    }

    /**
     * Fetches the savefile for the currently logged-in user from the server.
     */
    async fetchServerSavefile(): Promise<SaveFile>
    {
        const authService = this.ctx.getComponent(tokens.authService);

        const username = await authService.getCurrentUsername();
        const request = new Request("/api/savefile", { "method": "GET" });
        const response = await api.performRequestWithSessionToken(request);
        if (response.status !== "ok") {
            return createEmptySavefile(username);
        }

        return await response.data.json() as SaveFile;
    }

    /**
     * Writes the given savefile to local browser storage.
     */
    async writeLocalSavefile(savefile: SaveFile)
    {
        const authService = this.ctx.getComponent(tokens.authService);

        const activeUsername = await authService.getCurrentUsername();
        const key = STORAGE_KEY + (activeUsername ? "_" + activeUsername : "");
        const serialized = JSON.stringify(savefile);
        window.localStorage.setItem(key, serialized);
    }

    /**
     * Writes the given savefile to the server (based on the currently logged-in user)
     */
    async writeServerSavefile(savefile: SaveFile)
    {
        const serialized = JSON.stringify(savefile);
        const request = new Request("/api/savefile", {
            "method": "PUT",
            "body": serialized,
            "headers": {
                "Content-Type": "application/json"
            }
        });
        const response = await api.performRequestWithSessionToken(request);

        if (response.status == "unauthorized") {
            alert("Unable to write savefile to server - You are not logged in.");
        } else if (response.status == "bad_response" || response.status == "error") {
            alert("An error occured when trying to write savefile to server.");
        }
    }

}

function createEmptySavefile(username: string | undefined): SaveFile
{
    return {
        versionKey: ACTIVE_VERSION_KEY,
        username: username,
        lastPlayedNonogramId: undefined,
        entries: []
    };
}