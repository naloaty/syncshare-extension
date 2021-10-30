class Base {
    constructor() {
        const url = new URL(window.location.href);

        /** @type {string} */
        this.host = null || url.host;

        /** @type {number} */
        this.attemptId = null || parseInt(url.searchParams.get("attempt"));

        /** @type {number} */
        this.quizId = null || parseInt(url.searchParams.get("cmid"))
    }

    
}

export default Base;