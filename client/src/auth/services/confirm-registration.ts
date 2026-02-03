import { ApiService } from "../../api/api-service";
import * as app from "../../app"

/**
 * Given the confirmation token, confirms the registration and then redirects to the homepage.
 */
export async function confirmRegistration(token: string): Promise<void>
{
    const apiService = app.apiService;

    /* Send confirmation request to server */
    const request = new Request("/api/auth/confirm-registration?token=" + token, {
        method: "GET",
    });
    const response = await apiService.performRequest(request);

    /* Display a different text based on the response */
    let displayedText = "";

    switch (response.status) {
        case "ok":
            displayedText = "Confirmation successful. You can now log in with your new username.";
            break;

        case "bad_response":
            if (response.data.status == 404) {
                displayedText = "Unknown registration token."
            } else if (response.data.status == 409) {
                displayedText = "Someone has registered your username while your confirmation was pending. Please choose a different username.";
            } else {
                displayedText = "An error occured.";
            }
            break;

        case "unauthorized":
        case "error":
            displayedText = "An error occured";
            break;
    }

    displayedText += "<br>Redirecting to homepage in five seconds...";
    document.body.replaceChildren(document.createTextNode(displayedText));

    /* Redirect */
    setTimeout(() => app.navigateTo("/"), 5000);
}