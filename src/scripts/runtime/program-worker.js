import { syntax } from "./syntax.js";
import System from "./System.js";

const system = new System();
let instructions = undefined;
let currentContext = undefined;

onmessage = (event) => {
    try {
        const message = event.data;

        if (message.type === "LOAD") {
            instructions = message.payload;
            currentContext = "running";
        }

        if (message.type === "INPUT") {
            system.setValueAtPointer(message.payload);
            currentContext = "running";
        }

        while (system.counter < instructions.length && currentContext !== "paused") {
            switch (instructions[system.counter]) {
                case syntax.incrementPointer:
                    system.incrementPointer();
                    break;
                case syntax.decrementPointer:
                    system.decrementPointer();
                    break;
                case syntax.incrementValue:
                    system.incrementValue();
                    break;
                case syntax.decrementValue:
                    system.decrementValue();
                    break;
                case syntax.startLoop:
                    system.startLoop();
                    break;
                case syntax.endLoop:
                    system.endLoop();
                    break;
                case syntax.output:
                    const value = system.getValueAtPointer();
                    postMessage({ type: "OUTPUT", payload: value });
                    break;
                case syntax.input:
                    currentContext = "paused";
                    postMessage({ type: "INPUT" });
                    break;
            }

            system.incrementCounter();
        }

        if (system.counter >= instructions.length) {
            postMessage({ type: "FINISHED" });
            close();
        }
    } catch (error) {
        postMessage({ type: "ERROR", payload: error });
        close();
    }
};
