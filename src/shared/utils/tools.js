function hashString(str) {
    var hash = 0, i, chr;

    if (str.length === 0) return hash;

    for (i = 0; i < str.length; i++) {
        chr = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
    }

    return hash;
}

function hashImage(imageNode) {
    const comma = imageNode.src.lastIndexOf('/');

    const meta = {
        fn: washString(imageNode.src.slice(comma + 1)),
        // w: imageNode.width ? imageNode.width : -1,
        // h: imageNode.height ? imageNode.height : -1,
        alt: imageNode.alt ? imageNode.alt : "",
    }

    return hashString(JSON.stringify(meta));
}

function packImages(nodeList) {
    const result = [];

    forEach(nodeList, image => {
        result.push(hashImage(image))
    })

    return result;
}

function comparePackedImages(imageA, imageB) {
    return imageA === imageB;
}


function washString(str) {
    return str.replace(/^\ +|\ +$|\\n|\n/g, "");
}

function decodeFano(string, items) {

    if (items.length === 0)
        return [];

    if (string.length === 0)
        return [];


    function desc_len(a, b) {
        return b.length - a.length;
    }

    let copy = (' ' + string).slice(1);
    const result = {};

    for (let item of items.sort(desc_len)) {
        let i;

        while ((i = copy.indexOf(item, i + 1)) != -1) {
            result[i] = item;
        }

        const empty = new Array(item.length + 1).join(' ');
        copy = copy.replace(new RegExp(item, 'g'), empty);
    }

    return Object.values(result);
}


function findAppropriate(sample, array) {
    if (!sample.images)
        return null;

    for (let item of array) {
        if (!item.images)
            continue;

        let textMatch = false;
        let imgMatch = false;

        if (sample.text === item.text)
            textMatch = true;

        if (sample.images) {
            exit:
            for (let sImage of sample.images) {
                for (let iImage of item.images) {
                    if (comparePackedImages(sImage, iImage)) {
                        imgMatch = true;
                        break exit;
                    }
                }
            }
        }

        if (textMatch && imgMatch) {
            return item;
        }

        if (!textMatch && imgMatch && item.images.length > 0) {
            return item;
        }

        if (textMatch && !imgMatch && item.images.length === 0) {
            return item;
        }
    }

    return null;
}

function findByText(array, text) {
    for (let item of array) {
        if (item.text && item.text === text)
            return item;
    }

    return false;
}

const forEach = function (array, callback, scope) {
    for (var i = 0; i < array.length; i++) {
        callback.call(scope, array[i], i);
    }
};


function includes(array, list) {
    for (let item of array)
        if (list.indexOf(item) !== -1)
            return true;

    return false;
}

const States = {
    incorrect: 0,
    partiallycorrect: 1,
    correct: 2
}

function stateToWord(state) {
    switch (state) {
        case -1:
            return "";

        case 0:
            return "-";

        case 1:
            return "*";

        case 2:
            return "+";

        default:
            return "";

    }
}

function getState(classList) {
    const list = [...classList];

    for (let [kword, id] of Object.entries(States)) {
        if (list.indexOf(kword) !== -1) {
            return id;
        }
    }

    return -1;
}



function findMagicButton(node) {
    return node.querySelector("span .ss-btn .icon");
}

function desc_len(a, b) {
    return b.length - a.length;
}

function getUUID(answer) {
    let attachId = "";
    let valueId = "";
    const attachTo = answer.attachTo ? answer.attachTo : {};
    const value = answer.value;

    attachId += attachTo.type || "1";
    attachId += attachTo.slot || "2";
    attachId += attachTo.text || "3";

    if (attachTo.images) {
        attachTo.images.forEach(image => {
            attachId += image
        });
    }

    valueId += value.text || "{nOvAlUe}";
    valueId += value.checked ? "true" : "false";

    return hashString(attachId) + hashString(valueId);
}

function verifyRightAnswer(text) {
    const regex = /\d{1,}[,.]\d{1,}/g;
    const count = ((text || '').match(regex) || []).length;
    const colon = text.indexOf(':');

    if (count === 2 || colon === -1)
        return false;
    else
        return true;
}

export {
    hashString, packImages, washString, decodeFano,
    findAppropriate, findByText, forEach, includes,
    States, stateToWord, getState,
    findMagicButton, desc_len, getUUID, verifyRightAnswer
}