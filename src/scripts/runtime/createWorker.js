import { waitForInput } from "./index.js";
import { output, program } from "../global.js";

export function createWorker(abortController) {
    const scriptURL = new URL("program-worker.js", import.meta.url);
    const worker = new Worker(scriptURL, { type: "module" });

    worker.onmessage = async (event) => {
        const message = event.data;

        switch (message.type) {
            case "OUTPUT": {
                if (message.payload === 32) {
                    output.innerText += String.fromCharCode(160); // space code
                } else {
                    output.innerText += String.fromCharCode(message.payload);
                }
                break;
            }
            case "INPUT": {
                const value = await waitForInput(abortController);

                if (value) {
                    worker.postMessage({ type: "INPUT", payload: value });
                }
                break;
            }
            case "FINISHED": {
                program.exit(0);
                break;
            }
            case "ERROR": {
                program.exit(2, message.payload);
                break;
            }
        }
    };

    worker.onerror = () => {
        worker.terminate();

        if (abortController.signal.aborted) return;

        program.exit(1);
    };

    return worker;
}
