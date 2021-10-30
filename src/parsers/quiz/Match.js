import Question from "Parsers/quiz/Question"
import * as Images from "Utils/images"
import * as Sign from "Utils/signature"
import * as Array from "Utils/arrays"
import createMagicButton from "Widgets/MagicButton"
import { removeInvisible } from "Utils/strings"
import ssdeep from "Utils/ssdeep"

class Match extends Question {

    constructor(args) {
        super(args);

        const table   = this.container.querySelector("table.answer");
        const stems   = table.querySelectorAll("td.text");
        const selects = table.querySelectorAll("td.control > select");

        this.labels  = {};
        this.options = {};

        Array.forEach(selects[0].childNodes, option => {
            this.options[option.innerText] = option.value;
        });

        Array.forEach(stems, (stem, i) => {
            const select = selects[i];

            let meta = removeInvisible(stem.innerText);

            Array.forEach(stem.querySelectorAll("img"), image => {
                meta += Images.serialize(image) + ";";
            });

            this.labels[ssdeep.digest(meta)] = select;
        });
    }

    createWidgetAnchor(anchor) {
        let select = this.labels[anchor];

        // Try to find similar nodes in case 
        // the text of the question has changed
        if (!select) {
            const similar = Sign.findSimilar(anchor, Object.keys(this.labels));

            // If there are several similar values
            // then anchoring is not possible
            if (similar.length == 1)
                select = this.labels[similar[0]];
        }

        if (!select)
            return null;

        const button = createMagicButton();
        select.parentNode.appendChild(button);

        const onClick = data => select.value = this.options[data.text];

        return { onClick, button };
    }
}

export default Match;