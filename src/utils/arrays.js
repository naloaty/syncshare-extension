function contains(array, value) {
    for (let i = 0; i < array.length; i++) {
        if (array[i] === value)
            return true;
    }

    return false;
}

function forEach(array, callback) {
    for (let i = 0; i < array.length; i++)
        callback(array[i], i);
}

export { contains, forEach }