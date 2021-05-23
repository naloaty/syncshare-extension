import Mediator from "@/core/transport.js";
import QuestionHandler from "@/content/question-handler.js";
import "@/core/umami.js";

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
        const links = document.querySelectorAll("ol.breadcrumb a");
        const result = {}

        for (let link of links) {
            const url = new URL(link.href);

            switch (url.pathname) {
                case "/course/view.php":
                    if (result.courseName) continue;

                    result.courseId = parseInt(url.searchParams.get("id"));
                    result.courseName = link.title;
                    break;

                case "/mod/quiz/view.php":
                    result.quizName = link.innerText;
                    break;
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
            const result = {};

            Object.assign(result, parseUrl());
            Object.assign(result, parseBreadcrumb());
            Object.assign(result, parseState());

            return result;
        }
    }
})();

console.log("Content script loaded");

for (let b of document.querySelectorAll("div.que")) {
    QuestionHandler.handle(b);
}

const meta = Page.getMeta();

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

