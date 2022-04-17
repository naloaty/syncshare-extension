import TypeSelector from "content/quiz/questions/TypeSelector";
import Breadcrumb from "content/shared/Breadcrumb";
import Log from "shared/debug/log";
import browser from "webextension-polyfill";

class QuizPage {

    constructor() {
        const url = new URL(window.location.href);

        this.breadcrumb = new Breadcrumb();

        /** @type {string} */
        this.host = null || url.host;

        /** @type {number} */
        this.quizId = null || parseInt(url.searchParams.get("cmid"));

        /** @type {number} */
        this.attemptId = null || parseInt(url.searchParams.get("attempt"));

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
            host:     this.host,
            courseId: this.breadcrumb.courseId,
            quizId:   this.quizId || this.breadcrumb.quizId,
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
                    host:       this.host,
                    courseId:   this.breadcrumb.courseId,
                    courseName: this.breadcrumb.courseName,
                    quizId:     this.quizId || this.breadcrumb.quizId,
                    quizName:   this.breadcrumb.quizName,
                    attemptId:  this.attemptId,
                    questions:  this.serializeQuestions()
                }
            })
        });
    }

    processReview() {
        browser.runtime.sendMessage({
            type: "quiz-review-data",
            payload: {
                host:       this.host,
                courseId:   this.breadcrumb.courseId,
                courseName: this.breadcrumb.courseName,
                quizId:     this.quizId || this.breadcrumb.quizId,
                quizName:   this.breadcrumb.quizName,
                attemptId:  this.attemptId,
                questions:  this.serializeQuestions()
            }
        })
    }
}


const quizPage = new QuizPage();

if (document.querySelector("#page-mod-quiz-review")) {
    Log.info("QuizPage: serving as review");

    try {
        quizPage.processReview();
    } catch (e) {
        Log.error(e, "Error occurred while serving quiz review page");
    }
}
else {
    Log.info("QuizPage: serving as attempt");

    try {
        quizPage.processAttempt();
    } catch (e) {
        Log.error(e, "Error occurred while serving quiz attempt page");
    }
}