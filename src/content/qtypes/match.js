import {
    washString, packImages, getState, decodeFano,
    States, findAppropriate, createMagicButton,
    findMagicButton, desc_len, uploadFormulationImages
} from "@/core/tools.js";
import Question from "@/content/qtypes/question.js";

class MatchQ extends Question {

    constructor(meta, queDiv) {
        super(meta, queDiv);

        const table = this.base.querySelector("table.answer");
        const stems = table.querySelectorAll("td.text");
        const selects = table.querySelectorAll("td.control > select");

        const structure = {
            branches: [],
            choices: {},
            achoices: [],
            rchoices: {},
            table: table
        }

        for (let option of selects[0].childNodes) {
            structure.achoices.push(option.innerText);
            structure.choices[option.value] = option.innerText;
            structure.rchoices[option.innerText] = option.value;
        }

        structure.achoices = structure.achoices.sort(desc_len);

        for (let i = 0; i < stems.length; i++) {
            const branch = {}

            const imgs = stems[i].querySelectorAll("img");

            branch.select = selects[i];
            branch.text = washString(stems[i].innerText);
            branch.images = packImages(imgs);
            branch.imageFiles = uploadFormulationImages(imgs);

            structure.branches.push(branch);
        }

        this.struct = structure;
    }

    getText() {
        const result = {}

        const text = this.base.querySelector("div.qtext");
        const imgs = text.querySelectorAll("img");

        result.images = packImages(imgs);
        result.imageFiles = uploadFormulationImages(imgs);
        result.plain = text.innerText;
        result.options = [];
        result.choices = [];

        for (let choice of Object.values(this.struct.choices)) {
            result.options.push(choice);
        }

        for (let branch of this.struct.branches) {
            result.choices.push({
                images: branch.images,
                imageFiles: branch.imageFiles,
                text: branch.text
            });
        }

        return result;
    }

    getAnswers() {
        const result = []

        for (let branch of this.struct.branches) {
            const value = branch.select.value;

            if (!value || value == 0)
                continue;

            const answer = {}

            answer.attachTo = {}
            answer.attachTo.text = branch.text;
            answer.attachTo.images = branch.images;

            answer.value = { text: this.struct.choices[branch.select.value] }
            answer.state = getState(branch.select.parentNode.classList);

            result.push(answer);
        }

        return result;
    }

    getFeedback() {
        const result = []

        const feedback = this.base.querySelector("div.rightanswer");

        if (!feedback)
            return result;

        const colon = feedback.innerText.indexOf(":");
        const text = washString(feedback.innerText.slice(colon + 1));
        const atext = text.split(" → ");

        const choices = [];

        for (let sub of atext) {
            const ch = decodeFano(sub, this.struct.achoices);

            if (ch.length > 0)
                choices.push(ch[0]);
        }

        for (let i = 0; i < choices.length; i++) {
            const answer = {};

            answer.attachTo = {}
            answer.attachTo.text = this.struct.branches[i].text;
            answer.attachTo.images = this.struct.branches[i].images;

            answer.value = { text: choices[i] };
            answer.state = States.correct;

            result.push(answer);
        }

        return result;
    }

    getWidgetToken(attachTo) {
        const branch = findAppropriate(attachTo, this.struct.branches);

        if (!branch)
            return null;

        let btn = findMagicButton(branch.select.parentNode);

        if (!btn) {
            btn = createMagicButton();
            branch.select.parentNode.appendChild(btn);
        }

        const onClick = (value) => {
            branch.select.value = this.struct.rchoices[value.text];
        }

        return { onClick, button: btn };
    }
}

export default MatchQ;