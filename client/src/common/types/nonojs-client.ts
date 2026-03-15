/**
 * Interface that each nonojs client (e.g. mobile, desktop) must implement.
 */
export default interface NonojsClient {
    
    /**
     * Performs any sort of necessary initialization steps.
     */
    init(): Promise<void>

    /**
     * Opens the start page.
     */
    openStartPage(): Promise<void>;

    /**
     * Opens the playfield with the given nonogram.
     */
    openNonogram(nonogramId: string): Promise<void>;

    /**
     * Opens the catalog site.
     */
    openCatalog(): Promise<void>;

    /**
     * Opens the settings page.
     */
    openSettings(): Promise<void>;

    /**
     * Opens the login page.
     */
    openLogin(): Promise<void>;

    /**
     * Confirms a registration
     */
    confirmRegistration(token: string): Promise<void>;

    /**
     * Opens the not found page.
     */
    openNotFoundPage(): Promise<void>;

}