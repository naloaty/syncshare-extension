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
 * */
const m = {
    host: url.host,
    course: {
        id: bc.courseId,
        name: bc.courseName
    },
    quiz: {
        id: parseInt(url.searchParams.get("id")) || bc.quizId,
        name: bc.quizName
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

console.log(m);

if (!supported) {
    throw new Error("BoardPage: Page is not supported");
}

Log.info("BoardPage: Page is supported!");

browser.runtime.sendMessage({
    type: "board-page-open",
    payload: {
        quizId: m.quiz.id
    }
});
