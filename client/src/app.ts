import { isMobileDevice } from "./common/services/mobile-or-desktop";
import { launchDesktopApp } from "./desktop/desktop-app";
import { launchMobileApp } from "./mobile/mobile-app";

if (isMobileDevice()) {
    launchMobileApp();
} else {
    launchDesktopApp();
}