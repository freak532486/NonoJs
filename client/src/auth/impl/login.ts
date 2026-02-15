import { isASCII } from "./utils";
import * as apiClient from "../../api/api-client"
import * as tokenManagement from "../../api/token-management"
import { GetTokenResponse } from "nonojs-common";

/**
 * Performs a login. If the login is successful, the new tokens are written into the token store.
 */
export default async function login(username: string, password: string): Promise<
    { "status": "ok", data: undefined } |
    { "status": "bad_credentials", data: undefined } |
    { "status": "error", data: any }
>
{
    /* Check if username/password contain non-ASCII characters */
    if (!isASCII(username) || !isASCII(password)) {
        return { status: "bad_credentials", data: undefined };
    }

    /* Attempt login using basic auth */
    const basicAuth = btoa(username + ":" + password);
    const request = new Request("/api/auth/login", {
        method: "GET",
        headers: {
            "Authorization": "Basic " + basicAuth
        }
    });

    const response = await apiClient.performRequest(request);

    /* Handle bad cases */
    if (response.status == "unauthorized") {
        return { status: "bad_credentials", data: undefined };
    }

    if (response.status == "bad_response") {
        return { status: "error", data: response.data };
    }

    if (response.status == "error") {
        return { status: "error", data: response.data };
    }

    /* Handle the good case */
    const responseBody = (await response.data.json()) as GetTokenResponse;
    tokenManagement.setSessionToken(responseBody.sessionToken);
    tokenManagement.setRefreshToken(responseBody.refreshToken);
    return { status: "ok", data: undefined }
}