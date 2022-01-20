import Question from "content/quiz/questions/Question"
import MagicButton from "shared/widgets/MagicButton";

class Shortanswer extends Question {

    createWidgetAnchor(anchor) {
        const input = this.container.querySelector("span.answer > input");

        const button = new MagicButton();
        input.parentNode.appendChild(button.element);

        const onClick = data => input.value = data.text;

        return { onClick, button };
    }
}

export default Shortanswer;