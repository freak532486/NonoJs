import { isMobileDevice } from "./common/services/mobile-or-desktop";
import { Router } from "./common/services/routing/router";
import DesktopClient from "./desktop/desktop-client";
import MobileClient from "./mobile/mobile-client";


const client = isMobileDevice() ? new MobileClient() : new DesktopClient();
await client.init();
const router = new Router(client);
router.run();