import {
    washString, packImages, getState,
    States, findAppropriate, createMagicButton,
    findMagicButton, getUUID, desc_len, uploadFormulationImages
} from "@/core/tools.js";
import Question from "@/content/qtypes/question.js";

class MultiChoiceQ extends Question {

    constructor(meta, queDiv) {
        super(meta, queDiv);

        const answer = this.base.querySelector("div.answer");
        const inputs = answer.querySelectorAll("input:not([type=\"hidden\"])");

        const Type = {
            check: "checkbox",
            radio: "radio"
        }

        const structure = {
            choices: [],
            achoices: [],
            attachMap: {},
            answerDiv: answer
        }

        switch (inputs[0].type) {
            case "radio":
                structure.type = Type.radio;
                break;

            case "checkbox":
                structure.type = Type.check;
                break;

            default:
                throw `Unsupported multiselect -> ${inputs[0].type}`;
        }

        for (let input of inputs) {
            const choice = {};

            const imgs = label.querySelectorAll("img");

            const label = input.nextSibling;
            const text = washString(label.lastChild.textContent);
            const images = packImages(imgs);
            const imageFiles = uploadFormulationImages(imgs);

            choice.input = input;
            choice.text = text;
            choice.images = images;
            choice.imageFiles = imageFiles;

            const uuid = getUUID({
                attachTo: { type: structure.type, text, images },
                value: { text }
            });

            if (text)
                structure.achoices.push(text);

            structure.choices.push(choice);
            structure.attachMap[uuid] = choice;
        }

        structure.achoices = structure.achoices.sort(desc_len)

        this.struct = structure;
        this.types = Type;
    }

    getText() {
        const result = {}

        const text = this.base.querySelector("div.qtext");
        const imgs = text.querySelectorAll("img");

        result.images = packImages();
        result.imageFiles = uploadFormulationImages(imgs);
        result.plain = text.innerText;
        result.choices = [];

        for (let choice of this.struct.choices) {
            result.choices.push({
                images: choice.images,
                imageFiles: choice.imageFiles,
                text: choice.text
            });
        }

        return result;
    }

    getAnswers() {
        const result = [];

        const choices = this.struct.choices;
        const type = this.struct.type;
        const types = this.types;

        if (type === types.radio) {
            for (let choice of choices) {
                if (!choice.input.checked)
                    continue;

                result.push({
                    attachTo: {
                        type: type,
                        text: choice.text,
                        images: choice.images
                    },

                    value: { text: choice.text },
                    state: getState(choice.input.parentNode.classList)
                });

                break;
            }
        }
        else if (type === types.check) {
            for (let choice of choices) {
                result.push({
                    attachTo: {
                        type: type,
                        text: choice.text,
                        images: choice.images
                    },

                    value: { checked: choice.input.checked },
                    state: getState(choice.input.parentNode.classList)
                });
            }
        }

        return result;
    }

    getFeedback() {
        const result = [];

        const feedback = this.base.querySelector("div.rightanswer");

        if (!feedback)
            return result;

        const type = this.struct.type;
        const types = this.types;

        const colon = feedback.innerText.indexOf(":");
        const text = washString(feedback.innerText.slice(colon + 1));

        if (type === types.radio) {
            let cText = text;

            for (let ch of this.struct.achoices) {
                if (cText.indexOf(ch) < 0)
                    continue;

                cText = ch;
                break;
            }

            result.push({
                attachTo: {
                    type: type,
                    images: packImages(feedback.querySelectorAll("img")),
                    text: cText,
                },

                value: { text: cText },
                state: States.correct
            });
        }
        else if (type === types.check) {
            for (let child of feedback.childNodes) {
                if (child.childNodes.length < 1)
                    continue;

                let cText = washString(child.innerText);

                for (let ch of this.struct.achoices) {
                    if (cText.indexOf(ch) < 0)
                        continue;

                    cText = ch;
                    break;
                }

                result.push({
                    attachTo: {
                        type: type,
                        images: packImages(child.querySelectorAll("img")),
                        text: cText,
                    },

                    value: { checked: true },
                    state: States.correct
                });
            }
        }

        return result;
    }

    getWidgetToken(attachTo) {
        const type = this.struct.type;
        const types = this.types;

        if (type === types.radio) {
            let btn = findMagicButton(this.struct.answerDiv);

            if (!btn) {
                btn = createMagicButton();
                this.struct.answerDiv.appendChild(btn);
            }

            //const choice = findAppropriate(attachTo, this.struct.choices);

            const onClick = (value) => {
                const choice = this.struct.attachMap[value.uuid];

                if (choice)
                    choice.input.checked = true;
            }

            return { onClick, button: btn };
        }
        else if (type === types.check) {
            const choice = findAppropriate(attachTo, this.struct.choices);

            if (!choice)
                return null;

            let btn = findMagicButton(choice.input.parentNode);

            if (!btn) {
                btn = createMagicButton();
                choice.input.parentNode.insertBefore(btn, choice.input.nextSibling);
            }

            const onClick = (value) => {
                choice.input.checked = value.checked;
            }

            return { onClick, button: btn };
        }
    }
}

export default MultiChoiceQ;