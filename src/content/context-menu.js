/*
 * Author: Before Semicolon
 * Codepen: https://codepen.io/beforesemicolon
 */

import { Events } from  "@/core/analytics.js"

const attachContextMenu = (() => {
    const contextMenu = document.createElement("ul");
    let isShown = false;

    const hideOnResize = () => hideMenu(true);

    function hideMenu(e) {
        if (!isShown)
            return;

        if (e.target && e.target.getAttribute("ctx-menu"))
            return;

        if (e === true || !contextMenu.contains(e.target)) {
            contextMenu.remove();
            document.removeEventListener("click", hideMenu);
            window.removeEventListener("resize", hideOnResize);
            isShown = false;
        }
    };

    const attachOption = (target, opt) => {
        const item = document.createElement("li");
        item.className = "context-menu-item";
        item.innerHTML = `<span>${opt.label}</span>`;
        item.addEventListener("click", e => {
            e.stopPropagation();
            if (!opt.subMenu || opt.subMenu.length === 0) {
                opt.callback(opt);
                hideMenu(true);
            }
        });

        target.appendChild(item);

        if (opt.subMenu && opt.subMenu.length) {
            const subMenu = document.createElement("ul");
            subMenu.className = "context-sub-menu";
            item.appendChild(subMenu);
            opt.subMenu.forEach(subOpt => attachOption(subMenu, subOpt))
        }
    };

    const showMenu = (e, menuOptions) => {
        e.preventDefault();

        isShown = true;

        contextMenu.className = "context-menu";
        contextMenu.innerHTML = "";
        menuOptions.forEach(opt => attachOption(contextMenu, opt))
        document.body.appendChild(contextMenu);

        const { innerWidth, innerHeight } = window;
        const { offsetWidth, offsetHeight } = contextMenu;
        let x = 0;
        let y = 0;

        if (e.clientX >= (innerWidth / 2)) {
            contextMenu.classList.add("left");
        }

        if (e.clientY >= (innerHeight / 2)) {
            contextMenu.classList.add("top");
        }

        if (e.clientX >= (innerWidth - offsetWidth)) {
            x = "-100%";
        }

        if (e.clientY >= (innerHeight - offsetHeight)) {
            y = "-100%";
        }

        contextMenu.style.left = e.clientX + "px";
        contextMenu.style.top = e.clientY + "px";
        contextMenu.style.transform = `translate(${x}, ${y})`;
        document.addEventListener("click", (e) => hideMenu(e));
        window.addEventListener("resize", hideOnResize);
    };

    return (el, options) => {
        el.setAttribute("ctx-menu", "true");
        el.addEventListener("click", (e) => {
            showMenu(e, options);
        });
    };
})();

export { attachContextMenu };