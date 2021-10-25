import Question from "Parsers/quiz/Question"
import { removeInvisible } from "Utils/strings"
import * as Images from "Utils/images"
import * as Sign from "Utils/signature"
import ssdeep from "Utils/ssdeep"
import createMagicButton from "Widgets/MagicButton"

class Multichoice extends Question {

    constructor(args) {
        super(args);

        const answer = this.container.querySelector("div.answer");
        const inputs = answer.querySelectorAll("input[type=\"radio\"], input[type=\"checkbox\"]");

        this.answerDiv = answer;
        this.type = inputs[0].type;
        this.map = {};

        for (const input of inputs) {
            const label = input.nextSibling;

            let meta = removeInvisible(label.lastChild.textContent);

            for (const image of label.querySelectorAll("img"))
                meta += Images.serialize(image);

            this.map[ssdeep.digest(meta)] = input;
        }
    }

    createWidgetAnchor(anchor) {
        if (this.type === "radio") {
            const button = createMagicButton();
            this.answerDiv.appendChild(button);

            const onClick = (data) => {
                let choice = this.map[data.signature];

                // Try to find similar nodes in case 
                // the text of the question has changed
                if (!choice) {
                    const similar = Sign.findSimilar(data.signature, Object.keys(this.map));

                    // If there are several similar values
                    // then anchoring is not possible
                    if (similar.length == 1)
                        choice = this.map[similar[0]];
                }

                if (choice)
                    choice.checked = true;
            }

            return { onClick, button };
        }
        else if (this.type === "checkbox") {
            let choice = this.map[anchor];

            // Try to find similar nodes in case 
            // the text of the question has changed
            if (!choice) {
                const similar = Sign.findSimilar(anchor, Object.keys(this.map));
    
                // If there are several similar values
                // then anchoring is not possible
                if (similar.length == 1)
                    choice = this.map[similar[0]];
            }
    
            if (!choice)
                return null;

            const button = createMagicButton();
            choice.parentNode.insertBefore(button, choice.nextSibling);
            const onClick = data => choice.checked = data.checked;

            return { onClick, button };
        }

        return null;
    }
}

export default Multichoice;