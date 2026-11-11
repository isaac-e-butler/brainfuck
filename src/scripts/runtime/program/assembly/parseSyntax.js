import { tokenise } from "./tokenise.js";
import { parseOperand } from "./parseOperand.js";

const JUMP_OPERANDS = new Set(["JMP", "JZ", "JNZ", "HALT"]);

function parseSyntax(source) {
    const blocks = [{ body: [], end: null }];
    const labels = new Map();
    const addr = {
        range: 32,
        locked: false,
    };

    const currentBlock = () => blocks.at(-1);
    const startBlock = () => {
        const block = currentBlock();
        if (block.body.length > 0 || block.end) blocks.push({ body: [], end: null });
    };

    const lines = source.split("\n");
    for (let i = 0; i < lines.length; i++) {
        const raw = lines[i];
        const lineNumber = i + 1;

        const tokens = tokenise(raw, lineNumber);
        if (!tokens.length) continue;

        const operator = tokens.at(0)?.toUpperCase();

        switch (operator) {
            case "SET": {
                if (addr.locked) throw new Error(`Line ${lineNumber}: SET must come before any instruction`);

                const addrRange = Number(tokens.at(2));
                const invalidArgs =
                    tokens.length !== 3 ||
                    tokens.at(1).toUpperCase() !== "ADDR_RANGE" ||
                    !Number.isInteger(addrRange) ||
                    addrRange < 1;

                if (invalidArgs)
                    throw new Error(`Line ${lineNumber}: expected "SET ADDR_RANGE N" (N a positive integer)`);

                addr.range = addrRange;
                continue;
            }
            case "DEF": {
                if (tokens.length > 2 || !tokens.at(1).endsWith(":"))
                    throw new Error(`Line ${lineNumber}: invalid definition syntax`);

                const label = tokens.at(1).slice(0, -1);
                if (labels.has(label)) throw new Error(`Line ${lineNumber}: duplicate label "${label}"`);

                startBlock();
                labels.set(label, blocks.length - 1);
                continue;
            }
        }

        addr.locked = true; // lock addr range after first instruction
        const args = tokens.slice(1).map((s) => parseOperand(s, lineNumber));
        const cmd = { operator, args, lineNumber };

        if (currentBlock().end) startBlock();

        if (JUMP_OPERANDS.has(operator)) currentBlock().end = cmd;
        else currentBlock().body.push(cmd);
    }

    return { blocks, labels, addrRange: addr.range };
}

export default parseSyntax;
