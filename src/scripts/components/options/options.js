import { attachClickAnimation, createElement } from "../../helpers/index.js";
import { shareButton, copyButton, pasteButton, deleteButton } from "./index.js";
import { dropdown } from "../index.js";

const editorOptions = document.getElementById("editor-options");
const icon = "./src/icons/actions/more-options.svg";

function adjustOptionsToScreenSize(state, button, dropdown) {
    const editorBoundary = state.editor.container.getBoundingClientRect();
    const optionsBoundary = editorOptions.getBoundingClientRect();
    const offset = optionsBoundary.height / editorOptions.children.length;

    const shouldCollapse = optionsBoundary.bottom + offset * 0.75 > editorBoundary.bottom;

    if (shouldCollapse) {
        const indexToMove =
            editorOptions.lastChild === button.getElement()
                ? editorOptions.children.length - 2
                : editorOptions.children.length - 1;

        if (indexToMove < 0) return;

        const optionToMove = editorOptions.children[indexToMove];
        dropdown.add(optionToMove);

        adjustOptionsToScreenSize(state, button, dropdown);
    }

    const shouldExpand = optionsBoundary.bottom + offset * 2 < editorBoundary.bottom;

    if (shouldExpand && dropdown.count() > 0) {
        dropdown.removeFirst();

        adjustOptionsToScreenSize(state, button, dropdown);
    }
}

export function initialise(state) {
    const img = createElement("img", { src: icon, primitive: true });
    const optionsButton = createElement("button", {
        id: "more",
        class: "option-button",
        children: [img],
    });

    optionsButton.withElement((element) => {
        attachClickAnimation(element);
    });

    const parent = editorOptions;
    copyButton.initialise(parent, state);
    pasteButton.initialise(parent, state);
    deleteButton.initialise(parent, state);
    shareButton.initialise(parent, state);
    optionsButton.setParent(editorOptions);

    const dynamicDropdown = dropdown.create({
        container: editorOptions.parentElement,
        button: optionsButton,
    });

    adjustOptionsToScreenSize(state, optionsButton, dynamicDropdown);
    window.addEventListener("resize", () => adjustOptionsToScreenSize(state, optionsButton, dynamicDropdown));
}
