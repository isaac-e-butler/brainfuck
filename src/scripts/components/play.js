import { attachClickAnimation, createElement } from "../helpers/index.js";
import { createWorker, ExitCodeController, extractInstructions, waitForExitCode } from "../runtime/index.js";
import { inputBox, output, status } from "./index.js";

const runtimeOptions = document.getElementById("runtime-options");
const icon = {
    stop: "./src/icons/states/stop.svg",
    play: "./src/icons/states/play.svg",
};

async function play(state, button) {
    const exitCodeController = new ExitCodeController();
    const abort = () => exitCodeController.exit(3);

    try {
        inputBox.clear();
        status.clear();
        output.clear();

        button.setImg(icon.stop);
        button.withElement((element) => element.addEventListener("click", abort));

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

        button.withElement((element) => {
            element.removeEventListener("click", abort);
            element.addEventListener("click", () => play(state, button), { once: true });
        });
        button.setImg(icon.play);

        status.addInfo("Process terminated");
    }
}

export function initialise(state) {
    const img = createElement("img", { src: icon.play, primitive: true });
    const button = createElement("button", {
        id: "play",
        class: "option-button",
        children: [img],
    });

    button.withElement((element) => {
        element.addEventListener("click", () => play(state, button), { once: true });
        attachClickAnimation(element);
    });

    button.setParent(runtimeOptions);
}
