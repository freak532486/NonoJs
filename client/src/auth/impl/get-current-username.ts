import { CheckLoginStatusResponse } from "nonojs-common";
import * as apiClient from "../../api/api-client"

/**
 * Returns the name of the currently logged-in user. Returns undefined if the current user is not logged in.
 */
export default async function getCurrentUsername(): Promise<string | undefined> {
    const request = new Request("/api/auth/check-login-status", {
        "method": "GET"
    });

    const response = await apiClient.performRequestWithSessionToken(request);

    if (response.status == "unauthorized" || response.status == "error" || response.status == "bad_response") {
        return undefined;
    }

    const parsed = (await response.data.json()) as CheckLoginStatusResponse;
    return parsed.username;
}