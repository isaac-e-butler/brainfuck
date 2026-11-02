import { attachClickAnimation, createElement } from "../../helpers/index.js";

const icon = {
    paste: "./src/icons/actions/paste.svg",
    pasteDisabled: "./src/icons/actions/paste-disabled.svg",
};

async function paste(state, event) {
    event.stopPropagation();
    event.preventDefault();

    state.editor.debounceCursor();
    state.editor.resetReceiver();

    try {
        const text = await navigator.clipboard.readText();
        state.editor.insertText(text);
    } catch (error) {
        console.error("Error occurred while pasting:", error);
    }
}

export function initialise(parent, state) {
    const img = createElement("img", { src: icon.pasteDisabled, primitive: true });
    const button = createElement("button", {
        id: "paste",
        class: "option-button",
        children: [img],
    });

    if (window.isSecureContext) {
        button.withElement((element) => {
            element.addEventListener("click", (event) => paste(state, event));
            attachClickAnimation(element);
        });

        button.setDisabled(false);
        button.setImg(icon.paste);
    } else {
        button.setDisabled(true);
        button.setImg(icon.pasteDisabled);
    }

    button.setParent(parent);
}
