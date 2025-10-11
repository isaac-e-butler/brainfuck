import { inputForm } from "../common.js";

export const abortReadMessage = "ABORT_READ";

function parseInput(target) {
    const value = Object.fromEntries(new FormData(target)).input.trim();
    const numeric = parseInt(value);

    if (Number.isSafeInteger(numeric)) {
        return numeric;
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
                console.warn(
                    "Please enter a number or singular character; singular numbers can be escaped using '\\' for their character code;"
                );

                inputForm.reset();
            }
        }

        inputForm.addEventListener("submit", handleInput);
        abort.signal.addEventListener("abort", cleanAbort);
    });
}

export default readInput;
