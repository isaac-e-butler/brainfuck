import { inputForm, input, status } from "../global.js";

export const abortReadMessage = "ABORT_READ";

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

async function readInput(abort) {
    return await new Promise(async (resolve, reject) => {
        function cleanUp() {
            inputForm.removeEventListener("submit", handleInput);
            abort.signal.removeEventListener("abort", cleanAbort);
        }

        function cleanAbort() {
            cleanUp();
            reject(abortReadMessage);
        }

        async function handleInput(event) {
            function cleanResolveWith(value) {
                cleanUp();
                resolve(value);
            }

            const parsedValue = parseInput(event.target);

            if (parsedValue) {
                cleanResolveWith(parsedValue);
            } else {
                status.attachWarning("Input must be a single character - raw numbers must be prefixed with a '\\'");
                inputForm.reset();
                input.focus();
            }
        }

        inputForm.addEventListener("submit", handleInput);
        abort.signal.addEventListener("abort", cleanAbort);
    });
}

export default readInput;
