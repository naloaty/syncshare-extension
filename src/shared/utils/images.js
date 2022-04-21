
/**
 * Packs image metadata into one string:
 * <filename.ext>;<image alt>
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


/**
 * Packs several images into one string:
 * <filename.ext>;<image alt>
 * 
 * @param {HTMLImageElement[]} images Images to serialize
 */
function serializeArray(images) {
    let meta = [];

    for (const img of images)
        meta.push(serialize(img));

    return meta.join(";");
}

export { serialize, serializeArray }