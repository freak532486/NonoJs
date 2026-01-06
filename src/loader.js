/**
 * Loads a HTML file. Returns the first element inside it.
 * 
 * @param {String} path 
 * @returns {Promise<HTMLElement>}
 */
export async function loadHtml(path) {
    const res = await fetch(path);

    const ret = document.createElement("div");
    ret.innerHTML = await res.text();
    return /** @type {HTMLElement} */ (ret.firstChild);
}

/**
 * Attaches a CSS file to the document.
 * 
 * @param {string} path 
 */
export function attachCss(path) {
    if (document.querySelector(`link[href="${path}"]`)) {
        return;
    }

    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = path;
    document.head.appendChild(link);
}

/**
 * Detaches the given CSS file from the document.
 * @param {String} path 
 */
export function detachCss(path) {
    const link = document.querySelector(`link[href="${path}"]`);
    link?.remove();
}