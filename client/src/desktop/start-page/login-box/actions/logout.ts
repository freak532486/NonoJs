import AuthService from "../../../../common/services/auth/auth-service";
import { navigateTo } from "../../../../common/services/navigate-to";

export default class DesktopLogoutAction
{

    constructor(
        private readonly authService: AuthService
    ) {}

    async run()
    {
        await this.authService.logout();
        navigateTo("/");
    }

}