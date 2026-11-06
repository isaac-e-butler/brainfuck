import { inputBox, status } from "../components/index.js";

function parseInput(target) {
    const value = Object.fromEntries(new FormData(target)).input;

    const output = [];
    for (let i = 0; i < value.length; i++) {
        output.push(value.charCodeAt(i));
    }

    return output;
}

export async function waitForInput(controller) {
    return await new Promise(async (resolve) => {
        function processAborted() {
            inputBox.disable(handleInput);
            resolve();
        }

        async function handleInput(event) {
            const parsedValue = parseInput(event.target);
            controller.removeExitCodeListener(processAborted);
            inputBox.disable(handleInput);
            status.addInfo(`Program received char codes: '${parsedValue.join(" ")}'`);
            resolve(parsedValue);
        }

        inputBox.enable(handleInput);
        controller.addExitCodeListener(processAborted);
    });
}
