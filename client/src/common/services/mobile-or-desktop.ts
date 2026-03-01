const STORAGE_SETTING_KEY = "clientVersion";

export function isMobileDevice(): boolean
{
    /* Check if client version is forced from local settings */
    const storedSetting = getStoredClientVersion();
    if (storedSetting !== StoredClientVersion.NONE) {
        return storedSetting == StoredClientVersion.FORCE_MOBILE;
    }

    /* Decide whether this device is a mobile device */
    return isMobileBasedOnDeviceParameters();
}

/**
 * Decides whether this device is a mobile device based on device parameters such as screen width or user agent.
 */
function isMobileBasedOnDeviceParameters(): boolean
{
    /* Decide whether this device is a mobile device */
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;

    // Basic mobile user agent detection
    const isMobileUA = /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    const isDesktopUA = /windows nt|macintosh|mac os x|x11|linux/i.test(userAgent);

    // Touch capability check (helps with tablets and newer devices)
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

    // Optional viewport heuristic (useful fallback)
    const isSmallScreen = window.matchMedia("(max-width: 768px)").matches;

    return isMobileUA || (hasTouch && isSmallScreen && !isDesktopUA);
}


enum StoredClientVersion {
    FORCE_MOBILE, FORCE_DESKTOP, NONE
};

/**
 * Returns the stored setting which client version should be used.
 */
function getStoredClientVersion(): StoredClientVersion
{
    const stored = window.localStorage.getItem(STORAGE_SETTING_KEY);

    if (stored == StoredClientVersion.FORCE_MOBILE.toString()) {
        return StoredClientVersion.FORCE_MOBILE;
    } else if (stored == StoredClientVersion.FORCE_DESKTOP.toString()) {
        return StoredClientVersion.FORCE_DESKTOP
    } else {
        return StoredClientVersion.NONE;
    }
}