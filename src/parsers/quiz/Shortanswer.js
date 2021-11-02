import Question from "Parsers/quiz/Question";
import MagicButton from "Widgets/MagicButton";

class Shortanswer extends Question {

    createWidgetAnchor(anchor) {
        const input = this.container.querySelector("span.answer > input");

        const button = MagicButton.create();
        input.parentNode.appendChild(button);

        const onClick = data => input.value = data.text;

        return { onClick, button };
    }
}

export default Shortanswer;