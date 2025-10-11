import { syntax } from "./syntax.js";

function processInstructions(editor) {
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

export default processInstructions;
