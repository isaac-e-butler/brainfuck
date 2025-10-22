import { copyButton, deleteButton, inputBox, pasteButton, playButton, shareButton } from "./components/index.js";
import { Editor } from "./editor/editor.js";

window.addEventListener("DOMContentLoaded", () => {
    const state = {
        editor: new Editor(),
    };

    inputBox.initialise();
    playButton.initialise(state);
    shareButton.initialise(state);
    copyButton.initialise(state);
    pasteButton.initialise(state);
    deleteButton.initialise(state);
});
