import { attachClickAnimation, createElement, setButtonLoading } from "../../helpers/index.js";
import { modal } from "../index.js";

const icon = "./src/icons/actions/delete-forever.svg";

function deleteForever(button, state) {
    const restore = setButtonLoading(button);

    modal.open({
        parent: state.editor.container,
        titleText: "Delete all content?",
        confirmText: "Delete",
        cancelText: "Keep",
        action: () => {
            state.editor.resetContent();

            const url = new URL(window.location.href);
            const currentSearch = new URLSearchParams(window.location.search);
            if (currentSearch.has("bf")) {
                url.search = new URLSearchParams();
                window.history.pushState("bf-file", "", url);
            }
        },
        afterEffect: () => restore(),
        destructive: true,
    });
}

export function initialise(parent, state) {
    const img = createElement("img", { src: icon, primitive: true });
    const button = createElement("button", {
        id: "delete",
        class: "option-button",
        children: [img],
    });

    button.withElement((element) => {
        element.addEventListener("click", () => deleteForever(button, state));
        attachClickAnimation(element);
    });

    button.setParent(parent);
}
