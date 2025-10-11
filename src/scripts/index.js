import { inputForm, playButton, output, icons } from "./common.js";
import { processInstructions, runProgram } from "./runtime/index.js";
import Editor from "./editor/editor.js";

inputForm.addEventListener("submit", (event) => {
    event.preventDefault();
});

const editor = new Editor();

async function run() {
    const abort = new AbortController();

    function abortProgram() {
        abort.abort();
    }

    try {
        const programInstruction = processInstructions(editor);

        console.log("starting program:", programInstruction);

        output.innerText = "";
        playButton.removeEventListener("click", run);
        playButton.firstChild.src = icons.stop;
        playButton.addEventListener("click", abortProgram);

        const success = await runProgram(programInstruction, abort);

        if (success) {
            console.log("end of program");
        } else {
            console.log("program aborted");
        }
    } catch (error) {
        console.error("FATAL ERROR:", error);
    } finally {
        playButton.removeEventListener("click", abortProgram);
        playButton.firstChild.src = icons.play;
        playButton.addEventListener("click", run);
    }
}

playButton.addEventListener("click", run);
