import { syntax } from "./index.js";

export function extractInstructions(state) {
    const instructionSyntax = new Set(Object.values(syntax));

    let instructions = "";
    for (const char of state.editor.readText()) {
        if (instructionSyntax.has(char)) {
            instructions += char;
        }
    }

    return instructions;
}
