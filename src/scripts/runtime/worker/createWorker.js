import { output } from "../../components/index.js";
import { MessageType } from "./messageType.js";
import { waitForInput } from "../index.js";

export function createWorker(controller) {
    const scriptURL = new URL("program.worker.js", import.meta.url);
    const worker = new Worker(scriptURL, { type: "module" });

    worker.onmessage = async (event) => {
        const message = event.data;

        switch (message.type) {
            case MessageType.Output: {
                output.add(message.payload);
                break;
            }
            case MessageType.Input: {
                const value = await waitForInput(controller);

                if (Number.isSafeInteger(value)) {
                    worker.postMessage({ type: MessageType.Input, payload: value });
                }
                break;
            }
            case MessageType.Done: {
                controller.exit(0);
                break;
            }
            case MessageType.Error: {
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
