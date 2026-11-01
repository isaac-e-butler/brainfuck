import { getIconElement, setElementIcon } from "./elementIcon.js";

const loadingIcon = "./src/icons/states/loading.svg";

export function setButtonLoading(button) {
    const defaultIcon = getIconElement(button).src;

    button.setAttribute("disabled", "true");
    button.classList.add("loading");
    setElementIcon(button, loadingIcon);

    function restore() {
        button.removeAttribute("disabled");
        button.classList.remove("loading");
        setElementIcon(button, defaultIcon);
    }

    return restore;
}
