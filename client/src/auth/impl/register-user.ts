import { RegisterUserRequest } from "nonojs-common";
import * as apiClient from "../../api/api-client"
import { isASCII } from "./utils";

/**
 * Registers a new user with the given username and password.
 */
export default async function registerUser(username: string, password: string, emailAddress: string): Promise<
    { status: "ok", data: undefined } | /** User was created successfully */
    { status: "invalid_auth", data: undefined } | /** Username or password contains non-ASCII characters */
    { status: "user_exists", data: undefined } | /** User already exists. */
    { status: "error", data: any } /** An error occured. */
>
{
    /* Check if username/password contain non-ASCII characters */
    if (!isASCII(username) || !isASCII(password)) {
        return { status: "invalid_auth", data: undefined };
    }

    const body: RegisterUserRequest = {
        username: username,
        password: password,
        emailAddress: emailAddress
    };

    const request = new Request("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(body),
        headers: {
            "Content-Type": "application/json"
        }
    });

    const response = await apiClient.performRequest(request);

    if (response.status == "unauthorized") {
        throw new Error("Registration does not need authorization.");
    }

    if (response.status == "error") {
        return { status: "error", data: response.data };
    }

    if (response.status == "ok") {
        return { status: "ok", data: undefined };
    }

    /* Check if the bad response is a 409 Conflict. In that case, the user already exists */
    if (response.data.status == 409) {
        return { status: "user_exists", data: undefined };
    }

    return { status: "error", data: response };
}

