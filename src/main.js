import { SerializedNonogram } from "./catalog/catalog-load.js";
import { Catalog } from "./catalog/component/catalog.component.js";
import { PlayfieldComponent } from "./playfield/playfield.component.js";

const contentRoot = /** @type {HTMLElement} */ (document.getElementById("content-column"));

const catalog = new Catalog();

// await component.init(contentRoot);
await catalog.init(contentRoot);

/** @param {SerializedNonogram} nonogram */
catalog.onNonogramSelected = async nonogram => {
    catalog.view.remove();

    const playfield = new PlayfieldComponent(nonogram.rowHints, nonogram.colHints);
    await playfield.init(contentRoot);
    playfield.onExit = () => {
        playfield.view.remove();
        contentRoot.appendChild(catalog.view);
    }
};