import { inputBox, status } from "../components/index.js";

function parseInput(target) {
    const value = Object.fromEntries(new FormData(target)).input.trim();

    if (value.length > 1 && value.startsWith("\\")) {
        const numeric = parseInt(value.substring(1));

        return Number.isSafeInteger(numeric) ? numeric : undefined;
    }

    if (value.length <= 1) {
        return value.charCodeAt(0);
    }

    if (value.length === 2 && value.toLowerCase().startsWith("\\")) {
        return value.charCodeAt(1);
    }

    return undefined;
}

export async function waitForInput(controller) {
    return await new Promise(async (resolve) => {
        function processAborted() {
            inputBox.disable(handleInput);
            resolve();
        }

        async function handleInput(event) {
            const parsedValue = parseInput(event.target);

            if (parsedValue) {
                controller.removeExitCodeListener(processAborted);
                inputBox.disable(handleInput);

                status.addInfo(`Program received value '${parsedValue}'`);
                resolve(parsedValue);
            } else {
                status.addWarning("Input must be a single character - raw numbers must be prefixed with a '\\'");
                inputBox.clear();
                inputBox.focus();
            }
        }

        inputBox.enable(handleInput);
        controller.addExitCodeListener(processAborted);
    });
}
