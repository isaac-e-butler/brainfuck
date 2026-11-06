import Program from "../program/program.js";
import { MessageType } from "./messageType.js";

const state = {
    running: "running",
    paused: "paused",
};

const program = new Program();
const input = { value: [], done: true };
let currentState = undefined;

function readStoredInput() {
    const prev = input.value.length;
    if (!input.done) {
        program.setValue(input.value.shift() ?? 0);
        if (prev <= 0) input.done = true;
    }
}

onmessage = (event) => {
    try {
        const message = event.data;

        if (message.type === MessageType.Load) {
            program.load(message.payload);
            currentState = state.running;
        }

        if (message.type === MessageType.Input) {
            input.value = message.payload;
            input.done = false;
            readStoredInput();
            currentState = state.running;
        }

        while (!program.done() && currentState !== state.paused) {
            program.continue({
                output: function (value) {
                    postMessage({ type: MessageType.Output, payload: value });
                },
                input: function () {
                    if (input.done) {
                        currentState = state.paused;
                        postMessage({ type: MessageType.Input });
                    } else {
                        readStoredInput();
                    }
                },
            });
        }

        if (program.done() && currentState !== state.paused) {
            postMessage({ type: MessageType.Done });
            close();
        }
    } catch (error) {
        postMessage({ type: MessageType.Error, payload: error });
        close();
    }
};
