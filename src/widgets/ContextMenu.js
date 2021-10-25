/*
 * Author: Before Semicolon
 * Codepen: https://codepen.io/beforesemicolon
 */

const attachContextMenu = (() => {
    const contextMenu = document.createElement("ul");
    let isShown = false;

    const hideOnResize = () => hideMenu(true);

    function hideMenu(e) {
        if (!isShown)
            return;

        if (e?.target?.getAttribute("ctx-menu"))
            return;

        if (e === true || !contextMenu.contains(e.target)) {
            isShown = false;
            contextMenu.remove();
            document.removeEventListener("click", hideMenu);
            window.removeEventListener("resize", hideOnResize);
        }
    }

    const attachOption = (menu, opt) => {
        const hasSubMenu = opt.subMenu && opt.subMenu.length > 0;

        const item = document.createElement("li");
        item.className = "context-menu-item";

        let iconHTML = ``;

        if (opt.icon) {
            const icon = opt.icon;

            const styles = [
                icon.textColor ? `color: ${icon.textColor};` : '',
                icon.backColor ? `background-color: ${icon.backColor};` : ''
            ].join('');

            const style = styles ? `style="${styles}"` : ''; 
            const klass = icon.alignRight ? "post-icon" : "pre-icon"; 

            if (icon.name && !icon.text) 
                iconHTML += `<span ${style} class="${klass} icon fa ${icon.name} fa-fw"></span>`;

            if (icon.text && !icon.name)
                iconHTML += `<span ${style} class="${klass}">${icon.text}</span>`;
        }

        const optionText = `<span>${opt.label}</span>`;

        let innerHTML = opt?.icon?.alignRight ? optionText + iconHTML : iconHTML + optionText;

        if (hasSubMenu)
            innerHTML += `<span class="post-icon icon fa fa-angle-right fa-fw"></span>`

        item.innerHTML = innerHTML;

        item.addEventListener("click", e => {
            e.stopPropagation();
            if (!hasSubMenu) {
                if (opt.action) opt.action(opt);
                hideMenu(true);
            }
        });

        menu.appendChild(item);

        if (hasSubMenu) {
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

    return (element, options) => {
        element.setAttribute("ctx-menu", "true");
        element.addEventListener("click", e => showMenu(e, options));
    };

})();

export { attachContextMenu }