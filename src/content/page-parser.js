import { log } from "@/core/log";

const PageParser = (() => {

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

    return {
        getMeta: () => {
            const url = parseUrl();
            const breadcrumb = parseBreadcrumb();

            return {
                host:       url.host,
                attemptId:  url.attemptId,
                quizId:     url.quizId ? url.quizId : breadcrumb.quizId,
                quizName:   breadcrumb.quizName,
                courseId:   breadcrumb.courseId,
                courseName: breadcrumb.courseName,
            };
        }
    }
})();

log("Page meta parsed");

export default PageParser.getMeta();