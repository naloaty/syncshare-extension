function contains(array, value) {
    for (let i = 0; i < array.length; i++) {
        if (array[i] === value)
            return true;
    }

    return false;
}

export { contains }