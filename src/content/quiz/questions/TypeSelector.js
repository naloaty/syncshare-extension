import logger from "Internal/log"
import Match from "Content/quiz/questions/Match"
import Multianswer from "Content/quiz/questions/Multianswer"
import Multichoice from "Content/quiz/questions/Multichoice"
import Shortanswer from "Content/quiz/questions/Shortanswer"

class TypeSelector {

    /**
     * Selects appropriate class to correctly handle question.
     * 
     * @param {HTMLDivElement} container Question div container
     */
    select(container) {
        switch (container.classList[1]) {
            case "match": 
                return new Match({container});

            case "multianswer": 
                return new Multianswer({container});

            case "multichoice": 
            case "truefalse": 
                /* TODO: create seperate handler for truefalse question */
                return new Multichoice({container});

            case "shortanswer": 
            case "numerical": 
            case "calculated": 
                return new Shortanswer({container});

            default:
                logger.warn("Unknown question type:", container.classList[1]);
        }
    }
}

export default new TypeSelector();