import { Component, Context } from "nonojs-common";
import deleteUser from "./impl/delete-user";
import getCurrentUsername from "./impl/get-current-username";
import login from "./impl/login";
import logout from "./impl/logout";
import registerUser from "./impl/register-user";

export default class AuthService extends Component
{

    #currentUsername: string | undefined;
    #currentUsernameNeedsFetch: boolean = true;

    /**
     * Returns the name of the currently logged-in user.
     */
    async getCurrentUsername(): Promise<string | undefined> {
        if (this.#currentUsernameNeedsFetch) {
            this.#currentUsername = await getCurrentUsername();
            this.#currentUsernameNeedsFetch = false;
        }

        return this.#currentUsername;
    }

    /**
     * Deletes the active user.
     */
    async deleteActiveUser() {
        await deleteUser();
        this.#currentUsernameNeedsFetch = true;
    }

    /**
     * Attempts a log-in with the given credentials.
     */
    async login(username: string, password: string): Promise<
        { "status": "ok", data: undefined } |
        { "status": "bad_credentials", data: undefined } |
        { "status": "error", data: any }
    > {
        const ret = await login(username, password);
        this.#currentUsernameNeedsFetch = true;
        return ret;
    }

    /**
     * Logs out the current user.
     */
    async logout()
    {
        await logout();
        this.#currentUsernameNeedsFetch = true;
    }

    /**
     * Attempts to register a new user with the given credentials.
     */
    async registerUser(username: string, password: string, emailAddress: string): Promise<
        { status: "ok", data: undefined } | /** User was created successfully */
        { status: "invalid_auth", data: undefined } | /** Username or password contains non-ASCII characters */
        { status: "user_exists", data: undefined } | /** User already exists. */
        { status: "error", data: any } /** An error occured. */
    >
    {
        return registerUser(username, password, emailAddress);
    }

}