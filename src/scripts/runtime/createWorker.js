import { waitForInput } from "./index.js";
import { output } from "../global.js";

export function createWorker(controller) {
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
                const value = await waitForInput(controller);

                if (value) {
                    worker.postMessage({ type: "INPUT", payload: value });
                }
                break;
            }
            case "FINISHED": {
                controller.exit(0);
                break;
            }
            case "ERROR": {
                controller.exit(2, message.payload);
                break;
            }
        }
    };

    worker.onerror = () => {
        worker.terminate();

        if (controller.exited) return;

        controller.exit(1);
    };

    return worker;
}
