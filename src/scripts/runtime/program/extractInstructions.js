import { syntax } from "./syntax.js";

export function extractInstructions(text) {
    const instructionSyntax = new Set(Object.values(syntax));

    let instructions = "";
    for (const char of text) {
        if (instructionSyntax.has(char)) {
            instructions += char;
        }
    }

    return instructions;
}
