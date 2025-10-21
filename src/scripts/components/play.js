import { createWorker, ExitCodeController, extractInstructions, waitForExitCode } from "../runtime/index.js";
import { inputBox, output, status } from "./index.js";

const button = document.getElementById("play");
const icon = {
    stop: "./src/icons/states/stop.svg",
    play: "./src/icons/states/play.svg",
};

function updateButtonIcon(icon) {
    button.firstChild.src = icon;
}

async function play(state) {
    const exitCodeController = new ExitCodeController();
    const abort = () => exitCodeController.exit(3);

    try {
        inputBox.clear();
        status.clear();
        output.clear();

        updateButtonIcon(icon.stop);
        button.addEventListener("click", abort);

        if (!window.Worker) {
            status.addError("Program failed to load - browser doesn't support web-workers");
            return;
        }

        const instructions = extractInstructions(state);
        if (!instructions) {
            status.addError("Program failed to load - no instructions found");
            return;
        }

        const worker = createWorker(exitCodeController);
        exitCodeController.addExitCodeListener(() => worker.terminate());

        status.addInfo("Program starting:", instructions);
        worker.postMessage({ type: "LOAD", payload: instructions });

        await waitForExitCode(exitCodeController);
    } catch (error) {
        status.addError("Unexpected error occurred:", error);
        status.addWarning("Program exited with errors");
    } finally {
        inputBox.disable();

        button.removeEventListener("click", abort);
        button.addEventListener("click", () => play(state), { once: true });
        updateButtonIcon(icon.play);

        status.addInfo("Process terminated");
    }
}

export function initialise(state) {
    button.addEventListener("click", () => play(state), { once: true });
    updateButtonIcon(icon.play);
}
