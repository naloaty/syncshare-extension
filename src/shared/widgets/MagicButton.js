import Button from "shared/widgets/Button";

class MagicButton extends Button {

    createElement() {
        const element = document.createElement("span");
        element.classList.add("ss-btn", "icon", "fa", "fa-magic", "fa-fw");

        return element;
    }

}

export default MagicButton;