const button = document.getElementById("copy");
const icon = {
    paste: "./src/icons/actions/paste.svg",
    pasteDisabled: "./src/icons/actions/paste-disabled.svg",
};

function updateButtonIcon(icon) {
    button.firstChild.src = icon;
}

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
    if (window.isSecureContext) {
        button.addEventListener("click", (event) => paste(state, event));
        button.removeAttribute("disabled");

        updateButtonIcon(icon.paste);
        attachActivationEvent(button);
    } else {
        button.setAttribute("disabled", "true");
        updateButtonIcon(icon.pasteDisabled);
    }
}
