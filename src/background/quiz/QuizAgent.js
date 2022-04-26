import browser from "webextension-polyfill";
import Log from "shared/debug/log";

const State = Object.freeze({
    New: -1,
    Board: 1,
    Attempt: 2,
    Overview: 3,
    Review: 4,
    Submitted: 5
})

class Route {

    constructor() {
        /** @type {number} */
        this.state = 0;

        /** @type {String} host */
        this.host = null;

        /**
         * @type     {Object}
         * @property {number} id
         * @property {String} name
         * */
        this.course = {
            id: -1,
            name: null
        }

        /**
         * @type     {Object}
         * @property {number} id
         * @property {String} name
         * */
        this.quiz = {
            id: -1,
            name: null
        }

        /** @type {number} id */
        this.attemptId = -1;
    }

    onAttempt() {
        Log.info("OnAttempt: " + this.attemptId);
    }

    onOverview() {
        Log.info("OnOverview: " + this.attemptId);
    }

    onSubmitted() {
        Log.info("OnSubmitted: " + this.attemptId);
    }

    onReview() {
        Log.info("OnReview: " + this.attemptId);
    }

    onBoard() {
        Log.info("OnBoard: " + this.attemptId);
    }

}

class QuizAgent {

    init() {
        /** @type {Route[]} */
        this.routes = [];

        browser.runtime.onMessage.addListener(data => {
            if (data?.type !== "btn-submit-attempt")
                return;

            this.onSubmitAttempt(data.payload)
        });

        browser.runtime.onMessage.addListener(data => {
            if (data?.type !== "attempt-page-open")
                return;

            this.onAttemptPage(data.payload)
        });

        browser.runtime.onMessage.addListener(data => {
            if (data?.type !== "overview-page-open")
                return;

            this.onOverviewPage(data.payload)
        });

        browser.runtime.onMessage.addListener(data => {
            if (data?.type !== "review-page-open")
                return;

            this.onReviewPage(data.payload)
        });

        browser.runtime.onMessage.addListener(data => {
            if (data?.type !== "board-page-open")
                return;

            this.onBoardPage(data.payload)
        });

        Log.info("QuizAgent: initialized");
    }

    /**
     * @param    {Object} meta
     * @property {String} meta.quizId
     * @property {String} meta.attemptId
     * */
    onAttemptPage(meta) {
        for (const route of this.routes) {
            if (route.quiz.id !== meta.quizId)
                continue;

            switch (route.state) {
                case State.New:
                    route.state = State.Attempt;
                    route.attemptId = meta.attemptId;
                    route.onAttempt();
                    break;

                case State.Overview:
                    route.state = State.Attempt;
                    route.onAttempt()
                    break;

                default:
                    continue;
            }

            break;
        }
    }

    /**
     * @param    {Object} meta
     * @property {String} meta.quizId
     * */
    onOverviewPage(meta) {
        for (const route of this.routes) {
            if (route.quiz.id !== meta.quizId)
                continue;

            switch (route.state) {
                case State.Attempt:
                    route.state = State.Overview;
                    route.onOverview();
                    break;

                default:
                    continue;
            }

            break;
        }
    }

    /**
     * @param    {Object} meta
     * @property {String} meta.quizId
     * */
    onSubmitAttempt(meta) {
        for (const route of this.routes) {
            if (route.quiz.id !== meta.quizId)
                continue;

            switch (route.state) {
                case State.Overview:
                    route.state = State.Submitted;
                    route.onSubmitted();
                    break;

                default:
                    continue;
            }

            break;
        }
    }

    /**
     * @param    {Object} meta
     * @property {String} meta.quizId
     * */
    onReviewPage(meta) {
        for (const route of this.routes) {
            if (route.quiz.id !== meta.quizId)
                continue;

            switch (route.state) {
                case State.Submitted:
                    route.state = State.Review;
                    route.onReview();
                    break;

                default:
                    continue;
            }

            break;
        }
    }

    /**
     * @param    {Object} meta
     * @property {String} meta.host
     * @property {Object} meta.course
     * @property {number} meta.course.id
     * @property {String} meta.course.name
     * @property {Object} meta.quiz
     * @property {number} meta.quiz.id
     * @property {String} meta.quiz.name
     * */
    onBoardPage(meta) {
        for (const route of this.routes) {
            if (route.quiz.id !== meta.quiz.id)
                continue;

            switch (route.state) {
                case State.Submitted:
                case State.Review:
                    route.state = State.Board;
                    route.onBoard();
                    break;

                case State.New:
                case State.Attempt:
                    return;
            }
        }

        const route = new Route();
        route.state  = State.New;
        route.host   = meta.host;
        route.course = meta.course;
        route.quiz   = meta.quiz;

        this.routes.push(route);
    }
}

export default QuizAgent;