import { log } from "@/core/log";

const PageParser = (() => {

    const select = (args) => {
        for (let arg of args) {
            if (arg != null) {
                return arg
            }
        }
    }

    /* attemptId, quizId */
    const parseUrl = () => {
        const url = new URL(window.location.href);

        return {
            host: url.host,
            attemptId: parseInt(url.searchParams.get("attempt")),
            quizId: parseInt(url.searchParams.get("cmid"))
        }
    }

    /* courseId, courseName, quizName */
    const parseBreadcrumb = () => {
        const links = document.querySelectorAll(".breadcrumb a");
        const result = {}

        for (let link of links) {
            const url = new URL(link.href);

            if (url.pathname.includes("/course/view.php")) {
                if (result.courseName) continue;

                result.courseId = parseInt(url.searchParams.get("id"));
                result.courseName = link.title;
            }
            else if (url.pathname.includes("/mod/quiz/view.php")) {
                if (result.quizName) continue;

                result.quizName = link.innerText;
                result.quizId = parseInt(url.searchParams.get("id"));
            }
        }

        return result;
    }

    /* courseId, quizId */
    const parseBodyClasses = () => {
        const extract = (klass) => {
            const pos = klass.indexOf("-")
            return klass.slice(pos + 1)
        }

        const body = document.querySelector("body");
        const result = {};

        for (let klass of body.classList) {
            if (klass.startsWith("course-")) {
                result.courseId = parseInt(extract(klass));
            }
            else if (klass.startsWith("cmid-")) {
                result.quizId = parseInt(extract(klass));
            }
        }

        return result;
    }

    /* quizName */
    const parseWindowTitle = () => {
        const result = {};
        const isReview = document.querySelector("#page-mod-quiz-review")
        const title = document.querySelector("title").innerText;

        if (isReview) {
            const pos = title.lastIndexOf(":");
            result.quizName = title.slice(0, pos);
        } else {
            result.quizName = title
        }

        return result;
    }

    /* courseName */
    const parseHeading = () => {
        const result = {}
        const heading = document.querySelector("h1")

        if (heading != null) {
            result.courseName = heading.innerText;
        }

        return result;
    }

    return {
        getMeta: () => {
            const url = parseUrl();
            const breadcrumb = parseBreadcrumb();
            const bodyClasses = parseBodyClasses();
            const windowTitle = parseWindowTitle();
            const heading = parseHeading();

            return {
                host: url.host,
                attemptId: url.attemptId,
                quizId: select([
                    url.quizId,
                    breadcrumb.quizId,
                    bodyClasses.quizId
                ]),
                quizName: select([
                    breadcrumb.quizName,
                    windowTitle.quizName
                ]),
                courseId: select([
                    breadcrumb.courseId,
                    bodyClasses.courseId
                ]),
                courseName: select([
                    breadcrumb.courseName,
                    heading.courseName
                ])
            };
        }
    }
})();

log("Page meta parsed");

export default PageParser.getMeta();