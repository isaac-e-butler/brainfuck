const button = document.getElementById("copy");
const icon = {
    copy: "./src/icons/actions/copy.svg",
    copyDisabled: "./src/icons/actions/copy-disabled.svg",
};

function updateButtonIcon(icon) {
    button.firstChild.src = icon;
}

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
    if (window.isSecureContext) {
        button.addEventListener("click", (event) => copy(state, event));
        button.removeAttribute("disabled");

        updateButtonIcon(icon.copy);
        attachActivationEvent(button);
    } else {
        button.setAttribute("disabled", "true");
        updateButtonIcon(icon.copyDisabled);
    }
}
