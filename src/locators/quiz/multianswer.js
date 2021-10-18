import {
    washString, packImages, getState,
    States, findAppropriate, createMagicButton,
    findMagicButton, getUUID, verifyRightAnswer
} from "@/core/tools.js";
import Question from "@/content/qtypes/question.js";

class MultiAnswerQ extends Question {

    constructor(meta, queDiv) {
        super(meta, queDiv);

        const Type = {
            edit: "edit",
            combo: "combobox",
            check: "checkbox",
            radio: "radio"
        }

        const slotex = /sub\d{1,}/;

        const rachs = this.base.querySelectorAll("div.answer, table.answer");
        const combos = this.base.querySelectorAll("span.subquestion > select")
        const edits = this.base.querySelectorAll("span.subquestion > input");

        const structure = {};
        const attachMap = {};

        for (let rach of rachs) {
            const subq = { base: rach };

            const inputs = rach.querySelectorAll("input");
            const slot = inputs[0].name.match(slotex)[0];

            switch (inputs[0].type) {
                case "radio":
                    subq.type = Type.radio;
                    break;

                case "checkbox":
                    subq.type = Type.check;
                    break;

                default:
                    continue;
            }

            subq.choices = [];

            for (let input of inputs) {
                const choice = {};

                const label = input.labels[0];
                const text = washString(label.innerText);
                const images = packImages(label.querySelectorAll("img"));

                const uuid = getUUID({
                    attachTo: { slot, type: subq.type, text, images },
                    value: { text }
                });

                choice.input = input;
                choice.text = text;
                choice.images = images;

                subq.choices.push(choice);
                attachMap[uuid] = choice;
            }

            structure[slot] = subq;
        }

        for (let select of combos) {
            const slot = select.name.match(slotex)[0];

            const subq = {
                choices: {},
                rchoices: {},
                select: select,
                type: Type.combo
            }

            for (let option of select.childNodes) {
                if (!option.value)
                    continue;

                const text = washString(option.innerText);

                subq.choices[option.value] = text;
                subq.rchoices[text] = option.value;
            }

            structure[slot] = subq;
        }

        for (let input of edits) {
            const slot = input.name.match(slotex)[0];

            structure[slot] = {
                input: input,
                type: Type.edit
            }
        }

        this.attachMap = attachMap;
        this.struct = structure;
        this.types = Type;
    }

    getText() {
        const result = {}

        const text = this.base.querySelector("div.formulation");

        result.images = packImages(text.querySelectorAll("img"));
        result.plain = text.innerText;
        result.subquestions = [];

        for (let [slot, subq] of Object.entries(this.struct)) {
            const que = { type: subq.type, slot };

            switch (subq.type) {
                case this.types.combo:
                    que.options = Object.values(subq.choices);
                    break;

                case this.types.radio:
                case this.types.check:
                    que.choices = [];

                    Object.values(subq.choices).forEach(choice => {
                        const { text, images } = choice;
                        que.choices.push({ text, images });
                    });

                    break;

                case this.types.edit:
                    // Yep, nothing here
                    break;
            }

            result.subquestions.push(que);
        }

        return result;
    }

    getAnswers() {
        const result = [];

        for (let [slot, subq] of Object.entries(this.struct)) {
            if (subq.type === this.types.combo) {
                const value = subq.select.value;

                if (!Number.isInteger(value))
                    continue;

                const que = {
                    attachTo: {
                        slot,
                        type: subq.type
                    }
                };

                const text = subq.choices[value];

                que.value = { text };
                que.state = getState(subq.select.classList)

                result.push(que);
            }
            else if (subq.type === this.types.radio) {
                for (let choice of subq.choices) {
                    if (!choice.input.checked)
                        continue;

                    const que = {
                        attachTo: {
                            slot,
                            type: subq.type,
                            text: choice.text,
                            images: choice.images
                        }
                    };

                    que.value = { text: choice.text };
                    que.state = getState(choice.input.parentNode.classList);

                    result.push(que);
                    break;
                }
            }
            else if (subq.type === this.types.check) {
                for (let choice of subq.choices) {
                    const que = {
                        attachTo: {
                            slot,
                            type: subq.type,
                            text: choice.text,
                            images: choice.images
                        }
                    };

                    que.value = { checked: choice.input.checked };
                    que.state = getState(choice.input.parentNode.classList);

                    result.push(que);
                }
            }
            else if (subq.type === this.types.edit) {
                const text = subq.input.value;

                if (!washString(text))
                    continue;

                const que = {
                    attachTo: {
                        slot,
                        type: subq.type
                    }
                };

                que.value = { text };
                que.state = getState(subq.input.classList);

                result.push(que);
            }
        }

        return result;
    }

    getFeedback() {
        const result = [];

        for (let [slot, subq] of Object.entries(this.struct)) {
            if (subq.type === this.types.combo) {
                const parent = subq.select.parentNode;
                const feedback = parent.querySelector("span.feedbackspan");

                if (!feedback)
                    continue;

                const que = {
                    attachTo: {
                        slot,
                        type: subq.type
                    }
                };

                let correct;

                for (let child of feedback.childNodes) {
                    if (!verifyRightAnswer(child.textContent))
                        continue;

                    correct = child.textContent;
                }

                if (!correct)
                    continue;

                const begin = correct.indexOf(":") + 1;
                const value = correct.slice(begin)

                que.value = { text: washString(value) };
                que.state = States.correct;

                result.push(que);
            }
            else if (subq.type === this.types.radio) {
                const feedback = subq.base.nextSibling;

                if (!feedback || feedback.className !== "outcome")
                    continue;

                const que = {
                    attachTo: {
                        slot,
                        type: subq.type
                    }
                };

                let correct;

                for (let child of feedback.childNodes) {
                    if (!verifyRightAnswer(child.textContent))
                        continue;

                    correct = child.textContent;
                }

                if (!correct)
                    continue;

                const begin = correct.indexOf(":") + 1;
                const value = correct.slice(begin);

                const text = washString(value);

                que.state = States.correct;
                que.value = { text }
                que.attachTo.text = text;
                que.attachTo.images = packImages(feedback.querySelectorAll("img"));

                result.push(que);
            }
            else if (subq.type === this.types.check) {
                const feedback = subq.base.nextSibling;

                if (!feedback || feedback.className !== "outcome")
                    continue;

                const li = feedback.querySelectorAll("ul > li");

                for (let option of li) {
                    const que = {
                        attachTo: {
                            slot,
                            type: subq.type,
                            text: washString(option.innerText)
                        }
                    };

                    que.value = { checked: true };
                    que.state = States.correct;
                    que.attachTo.images = packImages(option.querySelectorAll("img"));

                    result.push(que);
                }
            }
            else if (subq.type === this.types.edit) {
                const parent = subq.input.parentNode;
                const feedback = parent.querySelector("span.feedbackspan");

                if (!feedback)
                    continue;

                const que = {
                    attachTo: {
                        slot,
                        type: subq.type
                    }
                };

                let correct;

                for (let child of feedback.childNodes) {
                    if (!verifyRightAnswer(child.textContent))
                        continue;

                    correct = child.textContent;
                }

                if (!correct)
                    continue;

                const begin = correct.indexOf(":") + 1;
                const value = correct.slice(begin);

                que.value = { text: washString(value) };
                que.state = States.correct;

                result.push(que);
            }
        }

        return result;
    }

    getWidgetToken(attachTo) {
        const subq = this.struct[attachTo.slot];

        if (!subq)
            return null;

        if (subq.type === this.types.combo) {
            let btn = findMagicButton(subq.select.parentNode);

            if (!btn) {
                btn = createMagicButton();
                subq.select.parentNode.appendChild(btn);
            }

            const onClick = (value) => {
                subq.select.value = subq.rchoices[value.text];
            }

            return { onClick, button: btn }
        }
        else if (subq.type === this.types.radio) {
            let btn = findMagicButton(subq.base)

            if (!btn) {
                btn = createMagicButton();
                subq.base.appendChild(btn);
            }

            //const choice = findAppropriate(attachTo, subq.choices);

            const onClick = (value) => {
                const choice = this.attachMap[value.uuid];

                if (choice)
                    choice.input.checked = true;
            }

            return { onClick, button: btn }
        }
        else if (subq.type === this.types.check) {
            const choice = findAppropriate(attachTo, subq.choices);

            if (!choice)
                return null;

            let btn = findMagicButton(choice.input.parentNode);

            if (!btn) {
                btn = createMagicButton();
                choice.input.parentNode.appendChild(btn);
            }

            const onClick = (value) => {
                choice.input.checked = value.checked;
            }

            return { onClick, button: btn }
        }
        else if (subq.type === this.types.edit) {
            let btn = findMagicButton(subq.input.parentNode);

            if (!btn) {
                btn = createMagicButton();
                subq.input.parentNode.appendChild(btn);
            }

            const onClick = (value) => {
                subq.input.value = value.text;
            }

            return { onClick, button: btn }
        }
    }
}

export default MultiAnswerQ;