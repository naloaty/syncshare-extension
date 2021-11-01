import * as stringSimilarity from "string-similarity"

/**
 * Removes the most spread invisble characters from the string.
 * 
 * @param   {string} str String to remove characters from
 * @returns {string}     String with removed characters
 */
function removeInvisible(str) {
    return str.replace(/^ +| +$|\\n|\n/g, "");
}

/**
 * @typedef  RatingItem Shows the similarity (rating) between mainString and a string from the targetStrings array
 * @type     {Object}
 * @property {string} target A string from the targetStrings array
 * @property {number} rating A fraction between 0 and 1, which indicates the degree of similarity between the two strings  
 */

/**
 * @typedef  BestMatchResult 
 * @type     {Object}
 * @property {RatingItem[]} ratings        An array of ratings of the targetStrings
 * @property {RatingItem}   bestMatch      An item from the targetStrings array, which has the greater rating
 * @property {number}       bestMatchIndex An index of the best match in the targetStrings array
 */

/**
 * Compares mainString against each string in targetStrings
 * 
 * @param {string}   mainString    The string to match each target string against
 * @param {string[]} targetStrings Each string in this array will be matched against the main string
 * @returns {BestMatchResult} 
 */
function findBestMatch(mainString, targetStrings) {
    return stringSimilarity.findBestMatch(mainString, targetStrings);
}

/**
 * Compares mainString against each string in targetStrings and returns
 * 
 * @param {string}   mainString    The string to match each target string against
 * @param {string[]} targetStrings Each string in this array will be matched against the main string
 * @returns {(string|null)} The most similar string from the targetStrings, or null if there is no such string
 */
function findSimilar(mainString, targetStrings) {
    const similar = findBestMatch(mainString, targetStrings);

    if (similar.bestMatch.rating > 0.5) {
        return similar.bestMatch.target;
    }

    return null;
}


export { removeInvisible, findBestMatch, findSimilar };