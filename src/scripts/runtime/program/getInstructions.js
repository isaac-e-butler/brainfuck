import { status } from "../../components/index.js";
import AssemblySyntaxFactory from "./assembly/syntaxFactory.js";
import { syntax } from "./syntax.js";

export function getInstructions(text, code) {
    if (code?.toUpperCase() === "ASM") {
        status.addInfo("Program transpiling from ASM");
        const { output, details } = new AssemblySyntaxFactory().transpile(text);
        status.addInfo(`Program finished transpiling: blocks=${details.blocks}, address_range=${details.addrRange}`);
        return output;
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
