import ssdeep from "Utils/ssdeep"

/**
 * Looks for similar signature in the array of signatures
 * 
 * @param   {string}   signature SSDeep signature
 * @param   {string[]} array     Array to look for similar signature
 * @returns {string[]}           Array of similar signatures from the array
 */
function findSimilar(signature, array) {
    return array.filter(v => ssdeep.similarity(signature, v) < 90);
}

export { findSimilar };