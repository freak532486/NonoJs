import * as apiClient from "../../api/api-client"

/**
 * Removes the active user from the server.
 */
export default async function deleteUser()
{
    const request = new Request("/api/auth/user", {
        "method": "DELETE"
    });
    const response = await apiClient.performRequestWithSessionToken(request);
    if (response.status !== "ok") {
        window.alert("An error occured. Your user could not be deleted.");
    }
}