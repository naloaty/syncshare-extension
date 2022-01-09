import Mediator from "@/core/transport.js";
import { log, error } from "@/core/log.js";
import MatchQ from "@/content/qtypes/match.js";
import ShortAnswerQ from "@/content/qtypes/shortanswer.js";
import MultiChoiceQ from "@/content/qtypes/multichoice.js";
import MultiAnswerQ from "@/content/qtypes/multianswer.js";
import EssayQ from "@/content/qtypes/essay.js";

const QuestionHandler = (() => {
    const questions = [];

    const handleQuestion = (queDiv, state) => {
        const meta = {
            type: null,
            behavior: null,
            state: null,
            grade: null,
            qid: null
        }

        try {
            const params = queDiv.classList;
            meta.type = params[1];
            meta.behavior = params[2];
            meta.state = params[3];

            const info = queDiv.childNodes[0];

            const regex = /\d{1,}[,.]\d{1,}/g;
            const element = info.querySelector("div.grade");

            meta.grade = []

            for (let item of element.innerText.matchAll(regex))
                meta.grade.push(parseFloat(item[0]))

            const post = info.querySelector("input.questionflagpostdata").value;
            const url = new URL("a://a/a?" + post);

            meta.qid = parseInt(url.searchParams.get("qid"));
        }
        catch (e) {
            error(e, "Cannot parse question metainfo", queDiv);
            return;
        }

        try {
            switch (meta.type) {
                //case "match": 
                //    questions.push(new MatchQ(meta, queDiv));
                //    break;

                //case "multianswer": 
                //    questions.push(new MultiAnswerQ(meta, queDiv));
                //    break;

                //case "multichoice": 
                //case "truefalse": 
                    /* This is not a good thing to use this type for truefalse */
                //    questions.push(new MultiChoiceQ(meta, queDiv));
                //    break;

                //case "shortanswer": 
                //case "numerical": 
                //case "calculated": 
                //    questions.push(new ShortAnswerQ(meta, queDiv));
                //    break;

                case "essay":
                    if (state !== "attempt") { return; }
                    questions.push(new EssayQ(meta, queDiv));
                    break;

                default:
                    log("Unknown question type", meta);
            }
        }
        catch (e) {
            error(e, "Cannot proccess question structure", meta, queDiv);
        }
    };

    const requestAnswers = (page) => {
        for (let question of questions) {
            const qid = `${page.host}@${question.meta.qid}`;

            Mediator.publish("sol-request", { 
                host: page.host,
                qid: question.meta.qid,
                type: question.meta.type,
                quizId: page.quizId,
                courseId: page.courseId
            })

            Mediator.subscribe(`sol-resp-${qid}`, (sols) => {
                question.setSolutions(sols);
            });
        }
    }

    const collectData = () => {
        const result = [];

        for (let question of questions) {
            result.push(question.getData());
        }

        return result;
    }

    return {
        handle: (queDiv, state) => handleQuestion(queDiv, state),
        collectData: () => collectData(),
        requestAnswers: (host) => requestAnswers(host)
    }
})();

export default QuestionHandler;