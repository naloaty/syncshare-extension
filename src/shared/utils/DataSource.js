class DataSource {

    constructor() {
        this.data = {}
        this.evaluate();
    }

    evaluate() {
        throw new Error("DataSource: process() is not overriden");
    }

    /**
     * @param {String} key
     */
    get(key) {
        if (this.data[key] === undefined)
            return null;

        if (this.data[key] === null)
            return null;

        if (Number.isNaN(this.data[key]))
            return null;

        return this.data[key];
    }
}

export default DataSource;