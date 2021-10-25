
/**
 * Removes most spread invisble characters from string.
 * 
 * @param   {string} str String to remove characters from
 * @returns {string}     String with removed characters
 */
function removeInvisible(str) {
    return str.replace(/^ +| +$|\\n|\n/g, "");
}

export { removeInvisible };