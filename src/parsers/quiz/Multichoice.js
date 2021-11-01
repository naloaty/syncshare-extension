import Question from "Parsers/quiz/Question"
import * as Strings from "Utils/strings"
import * as Images from "Utils/images"
import createMagicButton from "Widgets/MagicButton"

class Multichoice extends Question {

    constructor(args) {
        super(args);

        const answer = this.container.querySelector("div.answer");
        const inputs = answer.querySelectorAll("input[type=\"radio\"], input[type=\"checkbox\"]");

        this.options = {};
        this.answer  = answer;
        this.type    = inputs[0].type;

        for (const input of inputs) {
            const label = input.nextSibling;

            const sign = [
                Strings.removeInvisible(label.lastChild.textContent),
                Images.serializeArray(label.querySelectorAll("img"))
            ];

            this.options[sign.join(";")] = input;
        }
    }

    createWidgetAnchor(anchor) {
        if (this.type === "radio") {
            const button = createMagicButton();
            this.answer.appendChild(button);

            const onClick = (data) => {
                let choice = this.options[data.sign];

                // Try to find similar node in case 
                // the text of the question has changed
                if (!choice) {
                    const candidate = Strings.findSimilar(data.sign, Object.keys(this.options));

                    if (!candidate) {
                        return;
                    }

                    choice = this.options[candidate];
                }

                choice.checked = true;
            }

            return { onClick, button };
        }
        else if (this.type === "checkbox") {
            let choice = this.options[anchor.signature];

            // Try to find similar nodes in case 
            // the text of the question has changed
            if (!choice) {
                const candidate = Strings.findSimilar(anchor.sign, Object.keys(this.options));

                if (!candidate) {
                    return;
                }

                choice = this.options[candidate];
            }

            const button = createMagicButton();
            choice.parentNode.insertBefore(button, choice.nextSibling);
            const onClick = data => choice.checked = data.checked;

            return { onClick, button };
        }

        return null;
    }
}

export default Multichoice;