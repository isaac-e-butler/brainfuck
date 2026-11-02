import { attachClickAnimation, createElement } from "../../helpers/index.js";

const icon = {
    copy: "./src/icons/actions/copy.svg",
    copyDisabled: "./src/icons/actions/copy-disabled.svg",
};

async function copy(state, event) {
    event.stopPropagation();
    event.preventDefault();

    try {
        const text = state.editor.readText();
        await navigator.clipboard.writeText(text);
    } catch (error) {
        console.error("Error occurred while copying:", error);
    }
}

export function initialise(parent, state) {
    const img = createElement("img", { src: icon.copyDisabled, primitive: true });
    const button = createElement("button", {
        id: "copy",
        class: "option-button",
        children: [img],
    });

    if (window.isSecureContext) {
        button.withElement((element) => {
            element.addEventListener("click", (event) => copy(state, event));
            attachClickAnimation(element);
        });

        button.setDisabled(false);
        button.setImg(icon.copy);
    } else {
        button.setDisabled(true);
        button.setImg(icon.copyDisabled);
    }

    button.setParent(parent);
}
