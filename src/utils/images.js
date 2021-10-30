
/**
 * Packs image metadata into one string
 * 
 * @param {HTMLImageElement} img Image to serialize
 */
function serialize(img) {
    const fnBegin = img.src.lastIndexOf('/');
    let filename = "[NO FILENAME]";

    if (fnBegin !== -1)
        filename = img.src.slice(fnBegin + 1);
 
    const alt = img.alt || "[NO ALT]";
    return filename + ';' + alt
}

export { serialize }