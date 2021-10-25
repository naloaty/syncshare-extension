import Question from "Parsers/quiz/Question";
import { createMagicButton } from "Widgets/MagicButton";

class Shortanswer extends Question {

    createWidgetAnchor(anchor) {
        const input = this.container.querySelector("span.answer > input");

        const button = createMagicButton();
        input.parentNode.appendChild(button);

        const onClick = data => input.value = data.text;

        return { onClick, button };
    }
}

export default Shortanswer;