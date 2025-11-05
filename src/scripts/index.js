import { inputBox, playButton, optionMenu } from "./components/index.js";
import { Editor } from "./editor/editor.js";

window.addEventListener("DOMContentLoaded", () => {
    const state = {
        editor: new Editor(),
    };

    inputBox.initialise();
    playButton.initialise(state);
    optionMenu.initialise(state);
});
