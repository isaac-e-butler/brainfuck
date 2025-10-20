import { editor, input, output, playButton, shareButton, status } from "./global.js";
import { extractInstructions, createWorker, waitForExitCode, ExitCodeController } from "./runtime/index.js";
import { Compressor, Decompressor, Encoder } from "./compression/index.js";
import { icons } from "./icons.js";

async function initialiseProcess() {
    const exitCodeController = new ExitCodeController();
    const triggerAbortEvent = () => exitCodeController.exit(3);

    try {
        input.clear();
        status.clear();
        output.clear();
        playButton.firstChild.src = icons.stop;
        playButton.addEventListener("click", triggerAbortEvent);

        if (!window.Worker) {
            status.addError("Program failed to load - browser doesn't support web-workers");
            return;
        }

        const instructions = extractInstructions();
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
        input.disable();

        playButton.removeEventListener("click", triggerAbortEvent);
        playButton.firstChild.src = icons.play;
        playButton.addEventListener("click", initialiseProcess, { once: true });

        status.addInfo("Process terminated");
    }
}

playButton.addEventListener("click", initialiseProcess, { once: true });

shareButton.addEventListener("click", () => {
    const text = editor.readText();
    if (!text) return;

    const compressedText = new Compressor().compress(text);
    const encodedText = new Encoder().encode(compressedText);

    const url = new URL(window.location.href);
    url.search = new URLSearchParams({ bf: encodedText });

    window.history.pushState("bf-file", "", url);
});

window.onload = () => {
    const searchParams = new URLSearchParams(window.location.search);
    const encodedText = searchParams.get("bf");
    if (!encodedText) return;

    const decodedText = new Encoder().decode(encodedText);
    const decompressedText = new Decompressor().decompress(decodedText);

    editor.insertText(decompressedText);
};
