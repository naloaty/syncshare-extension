import Breadcrumb from "content/shared/Breadcrumb";
import Log from "shared/debug/log";
import browser from "webextension-polyfill";

const url = new URL(window.location.href);
const bc = new Breadcrumb();

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
const m = {
    host: url.host,
    course: {
        id: bc.courseId,
        name: bc.courseName
    },
    quiz: {
        id: parseInt(url.searchParams.get("cmid")) || bc.quizId,
        name: bc.quizName
    },
    attempt: {
        id: parseInt(url.searchParams.get("attempt"))
    }
}

// Check if page can be served
let supported = true;

if (!m.host)
    supported = false;
else if (!m.quiz.id || !m.quiz.name)
    supported = false;
else if (!m.course.id || !m.course.name)
    supported = false;
else if (!m.attempt.id)
    supported = false;

if (!supported) {
    throw new Error("OverviewPage: Page is not supported");
}

Log.info("OverviewPage: Page is supported!");

browser.runtime.sendMessage({
    type: "overview-page-open",
    payload: {
        quizId:    m.quiz.id,
        attemptId: m.attempt.id,
    }
});

const submitBtn = document.querySelector("form[action*=\"processattempt.php\"] > button[type=\"submit\"]");

submitBtn.addEventListener("click", event => {
    setTimeout(() => {
        const dialog = document.querySelector("div.confirmation-dialogue");

        if (!dialog) {
            Log.error("OverviewPage: Failed to capture submit button");
            return;
        }

        const confirmBtn = dialog.querySelector("input[type=\"button\"].btn.btn-primary");

        confirmBtn.addEventListener("click", event => {
            browser.runtime.sendMessage({
                type: "btn-submit-attempt",
                payload: {
                    quizId:    m.quiz.id,
                    attemptId: m.attempt.id,
                }
            });
        });
    }, 500);
});