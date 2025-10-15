import { inputForm, input, status } from "../global.js";

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

export async function waitForInput(abortController) {
    const defaultPlaceholder = input.placeholder;
    input.placeholder = "enter a value and press ↵";
    input.focus();

    return await new Promise(async (resolve) => {
        function processAborted() {
            inputForm.removeEventListener("submit", handleInput);
            input.placeholder = defaultPlaceholder;
            resolve();
        }

        async function handleInput(event) {
            const parsedValue = parseInput(event.target);

            if (parsedValue) {
                abortController.signal.removeEventListener("abort", processAborted);
                inputForm.removeEventListener("submit", handleInput);
                input.placeholder = defaultPlaceholder;
                inputForm.reset();

                status.attachInfo(`Program received value '${parsedValue}'`);
                resolve(parsedValue);
            } else {
                status.attachWarning("Input must be a single character - raw numbers must be prefixed with a '\\'");
                inputForm.reset();
                input.focus();
            }
        }

        inputForm.addEventListener("submit", handleInput);
        abortController.signal.addEventListener("abort", processAborted, { once: true });
    });
}
