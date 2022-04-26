import Log from "shared/debug/log";
import browser from "webextension-polyfill";
import MultiSource from "shared/utils/MultiSource";
import BreadcrumbSource from "content/quiz/sources/BreadcrumbSource";
import URLSource from "content/quiz/sources/board/URLSource";

const page = new MultiSource(
    new BreadcrumbSource(),
    new URLSource()
);

/** @type {String[]} */
const bcItems = page.get("bcItems");

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
    host: page.get("host"),
    course: {
        id: page.get("courseId"),
        name: page.get("courseName")
    },
    quiz: {
        id: page.get("quizId"),
        name: page.get("quizName") || bcItems[bcItems.length - 1]
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

if (!supported) {
    throw new Error("BoardPage: NotSupported: Missing required parameters");
}

Log.info("BoardPage: Check passed");

browser.runtime.sendMessage({
    type: "board-page-open",
    payload: { ...m }
});
