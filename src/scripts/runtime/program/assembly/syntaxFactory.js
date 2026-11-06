import parse from "./parse.js";

class AssemblySyntaxFactory {
    #output = "";
    #counter = 0;
    #cell = {
        runState: 0,
        counter: 1,
        counterDiff: 2,
        counterMatch: 3,
        temp1: 4,
        temp2: 5,
        reserved: 6,
    };

    goto(cell) {
        const delta = cell - this.#counter;
        this.#output += delta > 0 ? ">".repeat(delta) : "<".repeat(-delta);
        this.#counter = cell;
    }

    insertAt(cell, bf) {
        this.goto(cell);
        this.#output += bf;
    }

    set(cell, value) {
        this.insertAt(cell, "[-]" + "+".repeat(value));
    }

    copy(target, cell) {
        this.set(cell, 0);
        // drain target into temp1 & cell
        this.insertAt(target, "[-");
        this.insertAt(cell, "+");
        this.insertAt(this.#cell.temp1, "+");
        this.insertAt(target, "]");
        // drain temp1 back to target
        this.insertAt(this.#cell.temp1, "[-");
        this.insertAt(target, "+");
        this.insertAt(this.#cell.temp1, "]");
    }

    applyTargetValue(cell, target, sign) {
        this.copy(target, this.#cell.temp2);
        // apply the target's value to the cell
        this.insertAt(this.#cell.temp2, "[");
        this.insertAt(this.#cell.temp2, "-");
        this.insertAt(cell, sign);
        this.insertAt(this.#cell.temp2, "]");
    }

    ifCellNonZero(cell, body) {
        this.insertAt(cell, "[");
        body();
        this.insertAt(cell, "[-]]");
    }

    resolveCell(arg, cmd) {
        if (arg?.kind !== "cell") throw new Error(`Line ${cmd.lineNumber}: ${cmd.operand} expects a [cell]`);
        return this.#cell.reserved + arg.value;
    }

    resolveLabel(arg, cmd, labels) {
        if (arg?.kind !== "label") throw new Error(`Line ${cmd.lineNumber}: ${cmd.operand} expects a label`);

        const target = labels.get(arg.value);
        if (target === undefined) throw new Error(`Line ${cmd.lineNumber}: unknown label "${arg.value}"`);

        return target;
    }

    writeCmd(cmd) {
        const [arg1, arg2] = cmd.args;
        const cell = this.resolveCell(arg1, cmd);

        switch (cmd.operand) {
            case "MOV":
                if (arg2?.kind === "value") this.set(cell, arg2.value);
                else if (this.resolveCell(arg2, cmd) !== cell) {
                    const target = this.resolveCell(arg2, cmd);
                    this.copy(target, cell);
                }
                break;
            case "ADD":
            case "SUB":
                const sign = cmd.operand === "ADD" ? "+" : "-";
                if (arg2?.kind === "value") this.insertAt(cell, sign.repeat(arg2.value));
                else {
                    const target = this.resolveCell(arg2, cmd);
                    this.applyTargetValue(cell, target, sign);
                }
                break;
            case "OUT":
                this.insertAt(cell, ".");
                break;
            case "IN":
                this.insertAt(cell, ",");
                break;
            default:
                throw new Error(`Line ${cmd.lineNumber}: unknown operand ${cmd.operand}`);
        }
    }

    writeEndCmd(block, index, totalBlocks, labels) {
        const nextBlock = index + 1;
        const endCmd = block.end;

        if (!endCmd) {
            if (nextBlock < totalBlocks) this.set(this.#cell.counter, nextBlock);
            else this.set(this.#cell.runState, 0);

            return;
        }

        const [arg1, arg2] = endCmd.args;
        switch (endCmd.operand) {
            case "HALT":
                this.set(this.#cell.runState, 0);
                break;
            case "JMP":
                this.set(this.#cell.counter, this.resolveLabel(arg1, endCmd, labels));
                break;
            case "JNZ": {
                const cell = this.resolveCell(arg1, endCmd);
                const target = this.resolveLabel(arg2, endCmd, labels);

                this.set(this.#cell.counter, nextBlock);
                this.copy(cell, this.#cell.temp2);
                this.ifCellNonZero(this.#cell.temp2, () => this.set(this.#cell.counter, target));
                break;
            }
            case "JZ": {
                const cell = this.resolveCell(arg1, endCmd);
                const target = this.resolveLabel(arg2, endCmd, labels);

                this.set(this.#cell.counter, target);
                this.copy(cell, this.#cell.temp2);
                this.ifCellNonZero(this.#cell.temp2, () => this.set(this.#cell.counter, nextBlock));
                break;
            }
            default:
                throw new Error(`Line ${endCmd.lineNumber}: unknown jump ${endCmd.operand}`);
        }
    }

    writeBlock(index, body) {
        this.copy(this.#cell.counter, this.#cell.counterDiff);

        this.insertAt(this.#cell.counterDiff, "-".repeat(index));
        this.set(this.#cell.counterMatch, 1);
        this.ifCellNonZero(this.#cell.counterDiff, () => this.set(this.#cell.counterMatch, 0));

        // if match is still 1: run block
        this.insertAt(this.#cell.counterMatch, "[-");
        body();
        this.insertAt(this.#cell.counterMatch, "]");
    }

    transpile(source) {
        this.#output = "";
        this.#counter = 0;

        const { blocks, labels } = parse(source);
        if (blocks.length > 255) throw new Error(`Block size limit of ${255} reached: ${blocks.length} blocks`);

        blocks.push({ body: [], end: { operand: "HALT", args: [], line: 0 } });

        this.set(this.#cell.runState, 1);
        this.insertAt(this.#cell.runState, "[");
        blocks.forEach((block, i) => {
            this.writeBlock(i, () => {
                for (const cmd of block.body) this.writeCmd(cmd);
                this.writeEndCmd(block, i, blocks.length, labels);
            });
        });
        this.insertAt(this.#cell.runState, "]");

        return this.#output;
    }
}

export default AssemblySyntaxFactory;
