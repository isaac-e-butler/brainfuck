import { output, input, inputForm } from "../global.js";
import readInput, { abortReadMessage } from "./readInput.js";
import { syntax } from "./syntax.js";
import System from "./System.js";

async function runProgram(instructions, abort) {
    const system = new System();

    while (system.counter < instructions.length && !abort.signal.aborted) {
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

                if (value === 32) {
                    output.innerText += String.fromCharCode(160); // space code
                } else {
                    output.innerText += String.fromCharCode(value);
                }
                break;
            case syntax.input:
                input.focus();
                inputForm.classList.add("focus");

                try {
                    const value = await readInput(abort);
                    system.setValueAtPointer(value);
                } catch (reason) {
                    if (reason !== abortReadMessage) throw reason;
                } finally {
                    inputForm.classList.remove("focus");
                    inputForm.reset();
                    input.blur();
                }

                break;
        }

        system.incrementCounter();
    }

    return !abort.signal.aborted;
}

export default runProgram;
