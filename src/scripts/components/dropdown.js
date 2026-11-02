import { createElement } from "../helpers/element.js";

function alignToParentPosition(parent, dropdown) {
    const parentBoundary = parent.getElement().getBoundingClientRect();

    dropdown.withElement((element) => {
        element.style.top = `${parentBoundary.top + Math.ceil(parentBoundary.height + 2.5) / 2}px`;
        element.style.left = `calc(${parentBoundary.left}px + 1rem)`;
    });
}

export function create({ container, button }) {
    const optionsContent = createElement("div", { class: "dropdown-content", primitive: true });

    const dropdown = createElement("div", {
        class: "border dropdown",
        children: [optionsContent],
    });
    dropdown.setParent(container);
    button.setDisabled(true);

    const state = {
        active: false,
        open: function () {
            if (optionsContent.children.length <= 0) return;

            dropdown.addClass("dropdown-open");
            alignToParentPosition(button, dropdown);
            this.active = true;
        },
        close: function () {
            dropdown.removeClass("dropdown-open");
            this.active = false;
        },
    };

    window.addEventListener("resize", () => {
        alignToParentPosition(button, dropdown);

        if (!optionsContent.firstChild) {
            button.setDisabled(true);
            state.close();
        }
    });
    button.withElement((element) => {
        element.addEventListener("click", () => {
            if (state.active) state.close();
            else state.open();
        });
        document.addEventListener("click", (event) => {
            const parentClick = event.target === element || element.contains(event.target);
            if (!parentClick) state.close();
        });
    });

    return {
        add: function (option) {
            optionsContent.prepend(option);
            button.setDisabled(false);
        },
        removeFirst: function () {
            if (optionsContent.firstChild) {
                button.getElement().insertAdjacentElement("beforebegin", optionsContent.firstChild);
            }

            if (!optionsContent.firstChild) {
                button.setDisabled(true);
            }
        },
        count: function () {
            return optionsContent.children.length;
        },
    };
}
