import { washString, packImages, getState, 
    States, createMagicButton, findMagicButton, 
    uploadFormulationImages } from "@/core/tools.js";
import Question from "@/content/qtypes/question.js";

class ShortAnswerQ extends Question {

    constructor(meta, queDiv) {
        super(meta, queDiv);
    }

    getText() {
        const text = this.base.querySelector("div.qtext");
        const images = text.querySelectorAll("img");

        const imageFiles = uploadFormulationImages(images);

        return {
            plain: text.innerText,
            images: packImages(images),
            imageFiles: imageFiles
        };
    }

    getAnswers() {
        const input = this.base.querySelector("span.answer > input");

        if (!washString(input.value))
            return [];

        return [
            {
                attachTo: null,
                value: { text: input.value },
                state: getState(input.classList),
            }
        ];
    }

    getFeedback() {
        const block = this.base.querySelector("div.rightanswer");

        if (!block)
            return [];

        const begin = block.innerText.indexOf(":") + 1;
        const value = washString(block.innerText.slice(begin));

        return [
            {
                attachTo: null,
                value: { text: value },
                state: States.correct
            }
        ];
    }

    getWidgetToken(attachTo) {
        const input = this.base.querySelector("span.answer > input");
        let btn = findMagicButton(input.parentNode);

        if (!btn) {
            btn = createMagicButton();
            input.parentNode.appendChild(btn);
        }

        const onClick = (value) => {
            input.value = value.text;
        }

        return { onClick, button: btn };
    }
}

export default ShortAnswerQ;