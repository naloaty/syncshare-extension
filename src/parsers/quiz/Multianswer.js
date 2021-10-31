import Question from "Parsers/quiz/Question"
import ssdeep from "Utils/ssdeep"
import * as Image from "Utils/images"
import * as Sign from "Utils/signature"
import { removeInvisible } from "Utils/strings";
import createMagicButton from "Widgets/MagicButton"

class Multianswer extends Question {

    constructor(args) {
        super(args);

        const edits        = this.container.querySelectorAll("span.subquestion > input");
        const selects      = this.container.querySelectorAll("span.subquestion > select");
        const multichoices = this.container.querySelectorAll("div.answer, table.answer");

        const getSlot = node => node.name.match(/sub\d{1,}/)[0];

        this.edit        = {};
        this.select      = {};
        this.multichoice = {};    

        /* Shortanswer & numerical subquestion type */
        for (const input of edits) {
            this.edit[getSlot(input)] = { input }
        }

        /* Multichoice subquestion type */
        for (const mc of multichoices) {
            const inputs = mc.querySelectorAll("input[type=\"radio\"], input[type=\"checkbox\"]");

            const subQ = {
                options: {},
                answer: mc,
                type: inputs[0].type,
            }

            for (const input of inputs) {
                const label = input.nextSibling;

                const meta = [
                    removeInvisible(label.lastChild.textContent),
                    Image.serializeArray(label.querySelectorAll("img"))
                ];                  
    
                subQ.options[ssdeep.digest(meta.join(";"))] = input;
            }

            this.multichoice[getSlot(inputs[0])] = subQ;
        }

        /* Gap select subquestion type */
        for (const select of selects) {
            const subQ = {
                node: select,
                optionMap: {}
            }

            for (const option of select.childNodes) {
                if (!option.value)
                    continue;

                subQ.optionMap[option.innerText] = removeInvisible(option.value);
            }

            this.select[getSlot(select)] = subQ;
        }
    }

    createWidgetAnchor(anchor) {
        let subq = null;

        if (subq = this.select[anchor.index]) {
            const button = createMagicButton();
            subq.node.parentNode.appendChild(button);

            const onClick = (data) => {
                subq.node.value = subq.optionMap[data.text];
            }

            return { onClick, button };
        }
        else if (subq = this.multichoice[anchor.index]) {

            if ("radio" === subq.type) {
                const button = createMagicButton();
                subq.answer.appendChild(button);

                const onClick = (data) => {
                    let choice = subq.options[data.signature];

                    // Try to find similar nodes in case 
                    // the text of the question has changed
                    if (!choice) {
                        const similar = Sign.findSimilar(data.signature, Object.keys(subq.options));
    
                        // If there are several similar values
                        // then anchoring is not possible
                        if (similar.length == 1)
                            choice = subq.options[similar[0]];
                    }
    
                    if (choice)
                        choice.checked = true;
                }

                return { onClick, button };
            }
            
            if ("checkbox" === subq.type) {
                let choice = subq.options[anchor.signature];

                // Try to find similar nodes in case 
                // the text of the question has changed
                if (!choice) {
                    const similar = Sign.findSimilar(anchor.signature, Object.keys(subq.options));
        
                    // If there are several similar values
                    // then anchoring is not possible
                    if (similar.length == 1)
                        choice = subq.options[similar[0]];
                }
        
                if (!choice)
                    return null;
    
                const button = createMagicButton();
                choice.parentNode.insertBefore(button, choice.nextSibling);
                const onClick = data => choice.checked = data.checked;
    
                return { onClick, button };
            }

        }
        else if (subq = this.edit[anchor.index]) {
            const button = createMagicButton();
            subq.input.parentNode.appendChild(button);

            const onClick = (value) => {
                subq.input.value = value.text;
            }

            return { onClick, button };
        }
    }
}

export default Multianswer;