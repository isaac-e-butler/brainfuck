import { editor } from "../global.js";
import { syntax } from "./syntax.js";

export function extractInstructions() {
    let instructions = "";

    for (const child of editor.content.children) {
        const line = child.innerText;

        for (const char of line) {
            if (Object.values(syntax).includes(char)) {
                instructions += char;
            }
        }
    }

    return instructions;
}
