import TypeSelector from "content/quiz/questions/TypeSelector";
import Log from "shared/debug/log";
import browser from "webextension-polyfill";
import MultiSource from "shared/utils/MultiSource";
import BreadcrumbSource from "content/quiz/sources/BreadcrumbSource";
import LinkSource from "content/quiz/sources/quiz/LinkSource";
import URLSource from "content/quiz/sources/quiz/URLSource";

class QuizPage {

    constructor() {
        const page = new MultiSource(
            new BreadcrumbSource(),
            new LinkSource(),
            new URLSource()
        );

        /**
         * @type     {Object}
         * @property {String} host
         * @property {Object} course
         * @property {number} course.id
         * @property {String} course.name
         * @property {Object} quiz
         * @property {number} quiz.id
         * @property {String} quiz.name
         * @property {Object} attempt
         * @property {number} attempt.id
         * */
        this.meta = {
            host: page.get("host"),
            course: {
                id:   page.get("courseId"),
                name: page.get("courseName")
            },
            quiz: {
                id: page.get("quizId"),
                name: page.get("quizName")
            },
            attempt: {
                id: page.get("attemptId")
            }
        }

        /** @type {Question[]} */
        this.questions = [];

        for (const container of document.querySelectorAll("div.que")) {
            const question = TypeSelector.select(container);

            if (question) {
                this.questions.push(question);
            }
        }
    }

    serializeQuestions() {
        const questionsHTML = [];

        for (const question of this.questions) {
            const html = question.container.outerHTML;

            /** 
             * Remove session key from HTML to ensure user account safety
             */
            questionsHTML.push(html.replaceAll(/sesskey=.+;/g, ""));
        }

        return questionsHTML;
    }

    processAttempt() {
        const body = {
            host:     this.meta.host,
            courseId: this.meta.course.id,
            quizId:   this.meta.quiz.id,
            qId:      -1
        }
        
        for (const question of this.questions) {
            body.qId = question.qId;

            /* service/quiz */
            const sending = browser.runtime.sendMessage({
                type: "solution-request",
                payload: body
            })

            sending.then(solutions => {
                if (solutions) {
                    console.log("Solution response received", solutions);
                    question.handleSolutions(solutions)
                }
            });
            sending.catch(e => Log.error(e, "Error during solution request", body))
        }
        
        window.addEventListener("beforeunload", e => {
            browser.runtime.sendMessage({
                type: "quiz-attempt-data",
                payload: {
                    host:       this.meta.host,
                    courseId:   this.meta.course.id,
                    courseName: this.meta.course.name,
                    quizId:     this.meta.quiz.id,
                    quizName:   this.meta.quiz.name,
                    attemptId:  this.meta.attempt.id,
                    questions:  this.serializeQuestions()
                }
            });
        });
    }

    processReview() {
        browser.runtime.sendMessage({
            type: "quiz-review-data",
            payload: {
                host:       this.meta.host,
                courseId:   this.meta.course.id,
                courseName: this.meta.course.name,
                quizId:     this.meta.quiz.id,
                quizName:   this.meta.quiz.name,
                attemptId:  this.meta.attempt.id,
                questions:  this.serializeQuestions()
            }
        });
    }
}


const quizPage = new QuizPage();

// Check if page can be served
const m = quizPage.meta;

if (!m.quiz.id || !m.attempt.id) {
    throw new Error("QuizPage: NotSupported: Missing required parameters");
}

Log.info("QuizPage: Check passed")


if (document.querySelector("#page-mod-quiz-review")) {
    Log.info("QuizPage: serving as a review");

    browser.runtime.sendMessage({
        type: "review-page-open",
        payload: {
            quizId:    m.quiz.id,
            attemptId: m.attempt.id,
        }
    });

    try {
        quizPage.processReview();
    } catch (e) {
        Log.error(e, "Error occurred while serving quiz review page");
    }
}
else {
    Log.info("QuizPage: serving as an attempt");

    browser.runtime.sendMessage({
        type: "attempt-page-open",
        payload: {
            quizId:    m.quiz.id,
            attemptId: m.attempt.id,
        }
    });

    try {
        quizPage.processAttempt();
    } catch (e) {
        Log.error(e, "Error occurred while serving quiz attempt page");
    }
}