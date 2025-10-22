const icon = "./src/icons/states/loading.svg";

function updateButtonIcon(button, icon) {
    button.firstChild.src = icon;
}

export function setButtonLoading(button) {
    const defaultIcon = button.firstChild.src;

    button.setAttribute("disabled", "true");
    button.classList.add("loading");
    updateButtonIcon(button, icon);

    function restore() {
        button.removeAttribute("disabled");
        button.classList.remove("loading");
        updateButtonIcon(button, defaultIcon);
    }

    return restore;
}
