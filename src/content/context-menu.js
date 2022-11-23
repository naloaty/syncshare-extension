/*
 * Author: Before Semicolon
 * Codepen: https://codepen.io/beforesemicolon
 */
import Mediator from "@/core/transport.js";
import { Events } from  "@/core/analytics.js"
import PageMeta from "@/content/page-parser";
import hotkeys from 'hotkeys-js';

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
                window.umami.trackEvent("Magic value fill", Events.click);

                Mediator.publish("magic-used", { 
                    attemptId: PageMeta.attemptId
                });

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

    const widgets = [];
    let keyLock = false;

    hotkeys("esc", {
        keyup: true,
        keydown: true,
    }, (event, handler) => {
        if (event.type === "keyup") {
            keyLock = false;
            return;
        }

        if (keyLock)
            return;

        if (event.type === "keydown")
            keyLock = true;

        for (let widget of widgets) {
            widget.classList.toggle("widget-hidden");
        }
    })

    return (el, options) => {
        el.setAttribute("ctx-menu", "true");
        el.addEventListener("click", (e) => {
            window.umami.trackEvent("Magic menu open", Events.click);

            Mediator.publish("menu-opened", { 
                attemptId: PageMeta.attemptId
            });

            showMenu(e, options);
        });

        widgets.push(el);
    };
})();

export { attachContextMenu };