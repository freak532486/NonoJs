import * as apiClient from "../../api/api-client"
import * as tokenManagement from "../../api/token-management"

/**
 * Logs out the current active session. Does nothing if no session exists.
 */
export default async function logout()
{
    const refreshToken = tokenManagement.getRefreshToken();
    if (!refreshToken) {
        return;
    }

    const request = new Request("/api/auth/logout", {
        "method": "GET",
        "headers": {
            "Authorization": "Bearer " + refreshToken
        }
    });
    const response = await apiClient.performRequest(request);
    if (response.status !== "ok") {
        window.alert("An error occured. Logout was not successful.");
        return;
    }

    tokenManagement.clearTokens();
}