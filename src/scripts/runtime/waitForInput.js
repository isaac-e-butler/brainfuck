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
    return await new Promise(async (resolve) => {
        input.focus();

        async function handleInput(event) {
            const parsedValue = parseInput(event.target);

            if (parsedValue) {
                inputForm.removeEventListener("submit", handleInput);
                resolve(parsedValue);
            } else {
                status.attachWarning("Input must be a single character - raw numbers must be prefixed with a '\\'");
                inputForm.reset();
                input.focus();
            }
        }

        inputForm.addEventListener("submit", handleInput, { once: true });
        abortController.signal.addEventListener("abort", () => resolve(), { once: true });
    });
}
