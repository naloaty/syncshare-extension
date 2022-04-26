class MultiSource {

    /**
    * @param {DataSource} sources
    */
    constructor(...sources) {
        /** @type {DataSource[]} */
        this.sources = [];

        for (const source of sources)
            this.add(source);
    }

    /**
    * @param {DataSource} source
    */
    add(source) {
        this.sources.push(source);
    }

    /**
     * @param {String} key
     */
    get(key) {
        for (const source of this.sources) {
            if (source.get(key) !== null)
                return source.get(key);
        }

        return null;
    }
}

export default MultiSource;