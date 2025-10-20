import { editor, input, inputForm, output, playButton, shareButton, status } from "./global.js";
import { extractInstructions, createWorker, waitForExitCode } from "./runtime/index.js";
import { Compressor, Decompressor, Encoder } from "./compression/index.js";
import { icons } from "./icons.js";

async function initialiseProcess() {
    const abortController = new AbortController();
    const triggerAbortEvent = () => abortController.abort();

    try {
        inputForm.reset();
        status.clearLogs();
        output.innerText = "";
        playButton.firstChild.src = icons.stop;
        playButton.addEventListener("click", triggerAbortEvent);

        if (!window.Worker) {
            status.attachError("Program failed to load - browser doesn't support web-workers");
            return;
        }

        const instructions = extractInstructions();
        if (!instructions) {
            status.attachError("Program failed to load - no instructions found");
            return;
        }

        const worker = createWorker(abortController);
        const handleAbortEvent = () => {
            status.attachError("Program was aborted");
            worker.terminate();
        };
        abortController.signal.addEventListener("abort", handleAbortEvent, { once: true });

        status.attachInfo("Program starting:", instructions);
        worker.postMessage({ type: "LOAD", payload: instructions });

        await waitForExitCode(abortController);
    } catch (error) {
        status.attachError("Unexpected error occurred:", error);
        status.attachWarning("Program exited with errors");
    } finally {
        inputForm.classList.remove("focus");
        inputForm.reset();
        input.blur();

        playButton.removeEventListener("click", triggerAbortEvent);
        playButton.firstChild.src = icons.play;
        playButton.addEventListener("click", initialiseProcess, { once: true });

        status.attachInfo("Process terminated");
    }
}

inputForm.addEventListener("submit", (event) => event.preventDefault());
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
