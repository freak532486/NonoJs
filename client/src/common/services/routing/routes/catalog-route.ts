import NonojsClient from "../../../types/nonojs-client";
import Route from "../route";

export default class CatalogRoute implements Route
{

    matches(path: string): boolean {
        return path == "/catalog";
    }

    run(client: NonojsClient) {
        client.openCatalog();
    }
    
}