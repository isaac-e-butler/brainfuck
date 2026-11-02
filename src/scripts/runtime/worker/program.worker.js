import Program from "../program/program.js";
import { MessageType } from "./messageType.js";

const state = {
    running: "running",
    paused: "paused",
};

const program = new Program();
let currentState = undefined;

onmessage = (event) => {
    try {
        const message = event.data;

        if (message.type === MessageType.Load) {
            program.load(message.payload);
            currentState = state.running;
        }

        if (message.type === MessageType.Input) {
            program.setValue(message.payload);
            currentState = state.running;
        }

        while (!program.done() && currentState !== state.paused) {
            program.continue({
                output: function (value) {
                    postMessage({ type: MessageType.Output, payload: value });
                },
                input: function () {
                    currentState = state.paused;
                    postMessage({ type: MessageType.Input });
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
