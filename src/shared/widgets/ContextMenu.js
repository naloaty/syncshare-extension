/**
 * Based on https://codepen.io/beforesemicolon/pen/abNYjKo
 * Author: Before Semicolon
 */

import { EventEmitter } from "events";

let menuID = 1;

function getNextID() {
    return menuID++;
}

class ContextMenu extends EventEmitter {

    constructor(options) {
        super();

        this.options = options;
        this.isShown = false;
        this.menuId = getNextID();

        this.menu = document.createElement("ul");
        this.menu.classList.add("syncshare-cm");
        this.menu.hidden = true;

        this.constructMenu(this.menu, options);
        document.body.appendChild(this.menu);

        window.addEventListener("resize", e => this.hide());

        document.addEventListener("click", e => {
            const buttonId = parseInt(e.target.getAttribute("ctx-menu"));

            if (buttonId === this.menuId) {
                return;
            }

            this.hide(); 
        });

        document.addEventListener("scroll", e => {
            if (this.isShown) {
                this.hide();
            }
        });
    }

    constructMenu(root, options) {
        for (const option of options) {
            const isSubMenu = option.subMenu && option.subMenu.length > 0;
            const item = this.constructOption(option);

            item.addEventListener("click", e => {
                e.stopPropagation();

                if (!isSubMenu) {
                    if (option.action) {
                        option.action(option);
                    }

                    this.hide();
                    this.emit("OptionClick", option);
                }
            });

            root.appendChild(item);

            if (isSubMenu) {
                const subMenu = document.createElement("ul");
                subMenu.classList.add("sub-menu");
                item.appendChild(subMenu);

                this.constructMenu(subMenu, option.subMenu);
            }
        }
    }

    constructOption(option) {
        const item = document.createElement("li");
        item.classList.add("menu-item");

        const label = document.createTextNode(option.label);
        const labelSpan = document.createElement("span");
        labelSpan.classList.add("item-label");
        labelSpan.appendChild(label);
        item.appendChild(labelSpan);

        if (option.icon) {
            const icon = document.createElement("span");
            const iconOptions = option.icon;

            if (iconOptions.textColor) {
                icon.style.color = iconOptions.textColor;
            }

            if (iconOptions.backColor) {
                icon.style.backgroundColor = iconOptions.backColor;
            }

            if (iconOptions.name && !iconOptions.text) {
                icon.classList.add("icon", "fa", "fa-fw", iconOptions.name);
            }
            else if (iconOptions.text && !iconOptions.name) {
                const content = document.createTextNode(iconOptions.text);
                icon.appendChild(content);
            }

            if (iconOptions.alignRight) {
                const postfix = document.createElement("div");
                postfix.classList.add("postfix");
                icon.classList.add("content");
                postfix.appendChild(icon);
                item.appendChild(postfix);
            }
            else {
                icon.classList.add("prefix");
                item.insertBefore(icon, labelSpan);
            }
        }

        if (option.subMenu && option.subMenu.length > 0) {
            const postfix = document.createElement("div");
            postfix.classList.add("postfix");

            const subMenuIcon = document.createElement("span");
            subMenuIcon.classList.add("icon", "fa", "fa-fw", "fa-angle-right", "arrow-icon");

            postfix.appendChild(subMenuIcon);
            item.appendChild(postfix);
        }

        return item;
    }

    show(x, y) {
        if (this.isShown) {
            return;
        }

        const { innerWidth, innerHeight } = window;
        const { offsetWidth, offsetHeight } = this.menu;
        let tX = 0;
        let tY = 0;

        this.menu.classList.remove("left");
        this.menu.classList.remove("top");

        if (x >= (innerWidth / 2)) {
            this.menu.classList.add("left");
        }

        if (y >= (innerHeight / 2)) {
            this.menu.classList.add("top");
        }

        if (x >= (innerWidth - offsetWidth)) {
            tX = "-100%";
        }

        if (y >= (innerHeight - offsetHeight)) {
            tY = "-100%";
        }

        this.menu.style.left = x + "px";
        this.menu.style.top = y + "px";
        this.menu.style.transform = `translate(${tX}, ${tY})`;
        
        this.menu.hidden = false;
        this.isShown = true;
        this.emit("MenuShown");
    }

    hide() {
        if (!this.isShown) {
            return;
        }

        this.menu.hidden = true;
        this.isShown = false;
        this.emit("MenuHidden");
    }

    attach(button) {
        button.element.setAttribute("ctx-menu", this.menuId);
        button.element.addEventListener("click", e => {
            this.show(e.clientX, e.clientY);
        });
    }
}


export default ContextMenu;