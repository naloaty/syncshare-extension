import Question from "Parsers/quiz/Question"
import * as Images from "Utils/images"
import * as Sign from "Utils/signature"
import createMagicButton from "Widgets/MagicButton"
import { removeInvisible } from "Utils/strings"
import ssdeep from "Utils/ssdeep"

class Match extends Question {

    constructor(args) {
        super(args);

        const table = this.container.querySelector("table.answer");
        const stems = table.querySelectorAll("td.text");
        const selects = table.querySelectorAll("td.control > select");

        this.map = {};
        this.optionMap = {}

        for (const option of selects[0].childNodes) {
            this.optionMap[option.innerText] = option.value;
        }

        for (let i = 0; i < stems.length; i++) {
            const stem = stems[i];
            const select = selects[i];

            let meta = removeInvisible(stem.innerText);

            for (const image of stem.querySelectorAll("img"))
                meta += Images.serialize(image);

            this.map[ssdeep.digest(meta)] = select;
        }
    }

    createWidgetAnchor(anchor) {
        let select = this.map[anchor];

        // Try to find similar nodes in case 
        // the text of the question has changed
        if (!select) {
            const similar = Sign.findSimilar(anchor, Object.keys(this.map));

            // If there are several similar values
            // then anchoring is not possible
            if (similar.length == 1)
                select = this.map[similar[0]];
        }

        if (!select)
            return null;

        const button = createMagicButton();
        select.parentNode.appendChild(button);

        const onClick = data => select.value = this.optionMap[data.text];

        return { onClick, button };
    }
}

export default Match;