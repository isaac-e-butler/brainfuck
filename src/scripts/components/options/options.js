import { attachActivationEvent, createOptionButton } from "../../helpers/index.js";
import { shareButton, copyButton, pasteButton, deleteButton } from "./index.js";
import { dropdown } from "../index.js";

const options = document.getElementById("editor-options");

const icon = "./src/icons/actions/more-options.svg";
const button = createOptionButton({ id: "more", src: icon });
const collapsibleDropdown = dropdown.create({ container: options.parentElement, parent: button });

function adjustToScreenSize(state) {
    const editorBoundary = state.editor.container.getBoundingClientRect();
    const optionsBoundary = options.getBoundingClientRect();
    const offset = optionsBoundary.height / options.children.length;

    const shouldCollapse = optionsBoundary.bottom + offset * 0.75 > editorBoundary.bottom;

    if (shouldCollapse) {
        const indexToMove = options.lastChild === button ? options.children.length - 2 : options.children.length - 1;

        if (indexToMove < 0) return;

        const optionToMove = options.children[indexToMove];
        collapsibleDropdown.add(optionToMove);

        adjustToScreenSize(state);
    }

    const shouldExpand = optionsBoundary.bottom + offset * 2 < editorBoundary.bottom;

    if (shouldExpand && collapsibleDropdown.count() > 0) {
        collapsibleDropdown.removeFirst();

        adjustToScreenSize(state);
    }
}

export function initialise(state) {
    options.appendChild(button);
    attachActivationEvent(button);

    shareButton.initialise(state);
    copyButton.initialise(state);
    pasteButton.initialise(state);
    deleteButton.initialise(state);

    adjustToScreenSize(state);
    window.addEventListener("resize", () => adjustToScreenSize(state));
}
