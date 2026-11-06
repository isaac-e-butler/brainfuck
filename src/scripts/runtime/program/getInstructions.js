import AssemblySyntaxFactory from "./assembly/syntaxFactory.js";
import { syntax } from "./syntax.js";

export function getInstructions(text, code) {
    if (code?.toUpperCase() === "ASM") {
        return new AssemblySyntaxFactory().transpile(text);
    }

    return extractInstructions(text);
}

function extractInstructions(text) {
    const syntaxValues = new Set(Object.values(syntax));

    let output = "";
    for (const char of text) {
        if (syntaxValues.has(char)) output += char;
    }

    return output;
}
