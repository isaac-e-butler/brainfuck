import { attachActivationEvent, setElementIcon } from "../../helpers/index.js";

const button = document.getElementById("copy");
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

export function initialise(state) {
    button.className = "option-button";

    if (window.isSecureContext) {
        button.addEventListener("click", (event) => copy(state, event));
        button.removeAttribute("disabled");

        setElementIcon(button, icon.copy);
        attachActivationEvent(button);
    } else {
        button.setAttribute("disabled", "true");
        setElementIcon(button, icon.copyDisabled);
    }
}
