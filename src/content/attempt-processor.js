import Mediator from "@/core/transport.js";
import QuestionHandler from "@/content/question-handler.js";
import "@/core/umami.js";
import { log } from "@/core/log.js";

const Page = (() => {

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

    /* state */
    const parseState = () => {
        const state = document.querySelector("#page-mod-quiz-review");
        return { state: state ? "review" : "attempt" }
    }

    return {
        getMeta: () => {
            const url = parseUrl();
            const breadcrumb = parseBreadcrumb();
            const state = parseState();

            return {
                state:      state.state,
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

log("Content script loaded");

const meta = Page.getMeta();

for (let b of document.querySelectorAll("div.que")) {
    QuestionHandler.handle(b, meta.state);
}


if (meta.state === "review") {
    Mediator.publish("review-data", { 
        meta,
        qdata: QuestionHandler.collectData(),
        v: "1.0"
    });
}
else 
{
    QuestionHandler.requestAnswers(meta);
        
    window.addEventListener("beforeunload", (e) => {
        Mediator.publish("attempt-data", { 
            meta,
            qdata: QuestionHandler.collectData(),
            v: "1.0"
        });
    });
}

