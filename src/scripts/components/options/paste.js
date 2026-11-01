import { attachActivationEvent, setElementIcon } from "../../helpers/index.js";

const button = document.getElementById("paste");
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

export function initialise(state) {
    button.className = "option-button";

    if (window.isSecureContext) {
        button.addEventListener("click", (event) => paste(state, event));
        button.removeAttribute("disabled");

        setElementIcon(button, icon.paste);
        attachActivationEvent(button);
    } else {
        button.setAttribute("disabled", "true");
        setElementIcon(button, icon.pasteDisabled);
    }
}
