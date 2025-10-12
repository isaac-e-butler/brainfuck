import { processInstructions, runProgram } from "./runtime/index.js";
import { editor, status, inputForm, playButton, output, icons } from "./global.js";

inputForm.addEventListener("submit", (event) => {
    event.preventDefault();
});

async function startProgram() {
    const abort = new AbortController();

    function abortProgram() {
        abort.abort();
    }

    try {
        status.clearLogs();
        const instructions = processInstructions(editor);

        if (!instructions) {
            status.attachWarning("Failed to load program - no instructions found");
            return undefined;
        } else {
            status.attachInfo("Starting program:", instructions);
        }

        output.innerText = "";
        playButton.removeEventListener("click", startProgram);
        playButton.firstChild.src = icons.stop;
        playButton.addEventListener("click", abortProgram);

        const success = await runProgram(instructions, abort);

        if (success) {
            status.attachInfo("Program exited successfully");
        } else {
            status.attachWarning("Program aborted");
        }
    } catch (error) {
        status.attachError("Unexpected error occurred:", error.toString());
    } finally {
        playButton.removeEventListener("click", abortProgram);
        playButton.firstChild.src = icons.play;
        playButton.addEventListener("click", startProgram);

        status.attachInfo("Process terminated");
    }
}

playButton.addEventListener("click", startProgram);
