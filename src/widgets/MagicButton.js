class MagicButton {
    create() {
        const btn = document.createElement("span");
        btn.className = "ss-btn icon fa fa-magic fa-fw";
        return btn;
    }
}

export default new MagicButton();