import { JUMP_OPERANDS } from "./utils.js";

function parse(source) {
    const labelRefs = new Set();

    function parseOperand(text, line) {
        const isCell = text.startsWith("[") && text.endsWith("]");
        if (isCell) {
            const cell = parseInt(text.slice(1, -1));

            if (isNaN(cell) || cell < 0) throw new Error(`Line ${line}: bad cell reference "${text}"`);
            return { kind: "cell", value: cell };
        }

        const value = parseInt(text);
        if (isNaN(value)) {
            labelRefs.add(text);
            return { kind: "label", value: text };
        } else {
            return { kind: "value", value: value % 256 };
        }
    }

    const blocks = [{ body: [], end: null }];
    const labels = new Map();

    const current = () => blocks.at(-1);
    const startBlock = () => {
        const block = current();
        if (block.body.length > 0 || block.end) blocks.push({ body: [], end: null });
    };

    const lines = source.split("\n");
    for (let i = 0; i < lines.length; i++) {
        const raw = lines[i];
        const lineNumber = i + 1;

        const text = raw.split(";").at(0).trim();
        if (!text) continue;

        const segments = text.split(" ").filter(Boolean);
        if (!segments.length) continue;

        const operand = segments.at(0).toUpperCase();
        if (operand === "DEF") {
            if (segments.length > 2) throw new Error(`Line ${lineNumber}: invalid definition syntax "${text}"`);
            const label = segments.at(1).slice(0, -1);
            if (labels.has(label)) throw new Error(`Line ${lineNumber}: duplicate label "${label}"`);

            startBlock();
            labels.set(label, blocks.length - 1);
            continue;
        }

        const args = segments.slice(1).map((s) => parseOperand(s, lineNumber));
        const cmd = { operand, args, lineNumber };

        if (current().end) startBlock();

        if (JUMP_OPERANDS.has(operand)) current().end = cmd;
        else current().body.push(cmd);
    }

    const undeclaredLabels = labelRefs.difference(labels);
    if (undeclaredLabels.size > 0) throw new Error(`Undeclared labels found: "${undeclaredLabels.values().toArray()}"`);

    return { blocks, labels };
}

export default parse;
