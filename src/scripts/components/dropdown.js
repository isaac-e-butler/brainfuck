function alignToParentPosition(parent, dropdown) {
    const parentBoundary = parent.getBoundingClientRect();
    dropdown.style.top = `${parentBoundary.top + Math.ceil(parentBoundary.height + 2.5) / 2}px`;
    dropdown.style.left = `calc(${parentBoundary.left}px + 1rem)`;
}

export function create({ container, parent, initialOptions }) {
    const options = document.createElement("div");
    options.className = `dropdown-content`;

    if (Array.isArray(initialOptions) && initialOptions.length > 0) {
        options.append(...initialOptions);
    } else {
        parent.setAttribute("disabled", "true");
    }

    const dropdown = document.createElement("div");
    dropdown.className = "border dropdown";
    dropdown.appendChild(options);
    container.appendChild(dropdown);

    const state = {
        active: false,
        open: function () {
            if (options.children.length <= 0) return;

            dropdown.classList.add("dropdown-open");
            alignToParentPosition(parent, dropdown);
            this.active = true;
        },
        close: function () {
            dropdown.classList.remove("dropdown-open");
            this.active = false;
        },
        enable: function () {
            parent.removeAttribute("disabled");
        },
        disable: function () {
            parent.setAttribute("disabled", "true");
        },
        resize: function () {
            alignToParentPosition(parent, dropdown);

            if (!options.firstChild) {
                this.disable();
                this.close();
            }
        },
        click: function () {
            if (this.active) this.close();
            else this.open();
        },
    };

    window.addEventListener("resize", () => state.resize());
    parent.addEventListener("click", () => state.click());

    return {
        add: function (option) {
            options.prepend(option);
            state.enable();
        },
        removeFirst: function () {
            if (options.firstChild) {
                parent.insertAdjacentElement("beforebegin", options.firstChild);
            }

            if (!options.firstChild) {
                state.disable();
            }
        },
    };
}
