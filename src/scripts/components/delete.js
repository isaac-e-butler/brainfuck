import { attachActivationEvent } from "../helpers/attachActivationEvent.js";
import { setButtonLoading } from "../helpers/setButtonLoading.js";
import { modal } from "./index.js";

const button = document.getElementById("delete");
const icon = "./src/icons/actions/delete-forever.svg";

function deleteForever(state) {
    const restore = setButtonLoading(button);

    modal.open({
        parent: state.editor.container,
        titleText: "Delete all content?",
        confirmText: "Delete",
        cancelText: "Keep",
        action: () => {
            state.editor.resetContent();

            const url = new URL(window.location.href);
            url.search = new URLSearchParams();

            window.history.pushState("bf-file", "", url);
        },
        afterEffect: () => restore(),
        destructive: true,
    });
}

export function initialise(state) {
    button.firstChild.src = icon;
    button.addEventListener("click", () => deleteForever(state));

    attachActivationEvent(button);
}
