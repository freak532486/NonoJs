import Route from "../route";
import * as app from "../../app"
import * as auth from "../../auth"
import LoginComponent from "../../auth/components/login/login.component";
import ActiveComponentManager from "../../active-component-manager";
import { Component } from "nonojs-common";
import tokens from "../../tokens";

export default class LoginRoute extends Component implements Route
{

    matches(path: string): boolean {
        return path == "/login";
    }

    run(path: string) {
        const activeComponentManager = this.ctx.getComponent(tokens.activeComponentManager);

        /* Create login page */
        let loginPage = new LoginComponent(
            async (username, password) => {
                const result = await auth.login(username, password);
        
                switch (result.status) {
                    case "ok":
                        app.navigateTo("/");
                        break;
        
                    case "bad_credentials":
                        loginPage.loginMessage = "Wrong credentials.";
                        loginPage.loginMessageColor = "#FF0000";
                        break;
        
                    case "error":
                        loginPage.loginMessage = "An error occured. Details can be found in the browser console."
                        loginPage.loginMessageColor = "#FF0000";
                        console.error("An error occured during login.", result.data);
                        break;
                }
            },
        
            async (username, password, emailAddress) => {
                const result = await auth.registerUser(username, password, emailAddress);
                switch (result.status) {
                    case "ok":
                        loginPage.registerMessage = "A confirmation E-Mail has been sent to your address.";
                        loginPage.registerMessageColor = "#3dc41c";
                        break;
        
                    case "invalid_auth":
                        loginPage.registerMessage = "Username and password must only contain ASCII characters (no emojis, no foreign characters).";
                        loginPage.registerMessageColor = "#FF0000";
                        break;
        
                    case "user_exists":
                        loginPage.registerMessage = "User already exists.";
                        loginPage.registerMessageColor = "#FF0000";
                        break;
        
                    case "error":
                        loginPage.registerMessage = "An error occured. Details can be found in the browser console.";
                        loginPage.registerMessageColor = "#FF0000";
                        console.error("An error occured during registration.", result.data);
                        break;
                }
            }
        );

        activeComponentManager.setActiveComponent(loginPage);
        document.title = "Log in to NonoJs";
    }
    
}