import parse from "./parse.js";

class AssemblySyntaxFactory {
    #output = "";
    #pointer = 0;
    #cell = {
        runState: 0,
        counter: 1,
        counterDiff: 2,
        counterMatch: 3,
        temp1: 4,
        temp2: 5,
        reserved: 6,
    };
    #addrRange = 0;
    #artifact = {
        index: 0,
        temp: 0,
        value: 0,
        size: 3,
    };

    getAddrBoundary() {
        return this.#cell.reserved + this.#addrRange;
    }

    goto(cell) {
        const delta = cell - this.#pointer;
        this.#output += delta > 0 ? ">".repeat(delta) : "<".repeat(-delta);
        this.#pointer = cell;
    }

    gotoNextArtifact() {
        this.goto(this.#artifact.index + this.#artifact.size);
        this.#pointer = this.#artifact.index;
    }

    gotoPreviousArtifact() {
        this.goto(this.#artifact.index + -this.#artifact.size);
        this.#pointer = this.#artifact.index;
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

    move(target, cell) {
        this.insertAt(target, "[-");
        this.insertAt(cell, "+");
        this.insertAt(target, "]");
    }

    applyTargetValue(cell, target, sign) {
        this.copy(target, this.#cell.temp2);
        // apply the target's value to the cell
        this.insertAt(this.#cell.temp2, "[-");
        this.insertAt(cell, sign);
        this.insertAt(this.#cell.temp2, "]");
    }

    ifCellNonZero(cell, body) {
        this.insertAt(cell, "[");
        body();
        this.insertAt(cell, "[-]]");
    }

    walkForward() {
        this.insertAt(this.#artifact.index, "[");
        this.move(this.#artifact.temp, this.#artifact.temp + this.#artifact.size);
        this.move(this.#artifact.index, this.#artifact.index + this.#artifact.size);
        this.insertAt(this.#artifact.index, "+");
        this.gotoNextArtifact();
        this.insertAt(this.#artifact.index, "-]");
    }

    walkBackWithValue(takeValue) {
        if (takeValue) this.move(this.#artifact.temp, this.#artifact.temp - this.#artifact.size);
        this.gotoPreviousArtifact();
        this.insertAt(this.#artifact.index, "[[-]");
        if (takeValue) this.move(this.#artifact.temp, this.#artifact.temp - this.#artifact.size);
        this.gotoPreviousArtifact();
        this.insertAt(this.#artifact.index, "]");
    }

    resolveCell(arg, cmd) {
        if (arg?.kind !== "cell") throw new Error(`Line ${cmd.lineNumber}: ${cmd.operand} expects an address [N]`);
        if (arg?.value >= this.#addrRange)
            throw new Error(
                `Line ${cmd.lineNumber}: [${arg.value}] is greater than the address_range [0]..[${this.#addrRange - 1}]`,
            );
        return this.#cell.reserved + arg.value;
    }

    resolveLabel(arg, cmd, labels) {
        if (arg?.kind !== "label") throw new Error(`Line ${cmd.lineNumber}: ${cmd.operand} expects a label`);

        const target = labels.get(arg.value);
        if (target === undefined) throw new Error(`Line ${cmd.lineNumber}: unknown label "${arg.value}"`);

        return target;
    }

    store(addr, target) {
        this.copy(addr, this.#artifact.index);
        this.copy(target, this.#artifact.temp);
        this.walkForward();
        this.insertAt(this.#artifact.value, "[-]");
        this.move(this.#artifact.temp, this.#artifact.value);
        this.walkBackWithValue(false);

        this.#pointer = this.getAddrBoundary();
    }

    load(cell, addr) {
        this.copy(addr, this.#artifact.index);
        this.walkForward();
        this.insertAt(this.#artifact.value, "[-");
        this.insertAt(this.#artifact.temp, "+");
        this.insertAt(this.#artifact.index, "+");
        this.insertAt(this.#artifact.value, "]");
        this.move(this.#artifact.index, this.#artifact.value);
        this.walkBackWithValue(true);

        this.#pointer = this.getAddrBoundary();
        this.set(cell, 0);
        this.move(this.getAddrBoundary() + 1, cell);
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
            case "STORE":
                this.store(cell, this.resolveCell(arg2, cmd));
                break;
            case "LOAD":
                this.load(cell, this.resolveCell(arg2, cmd));
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
        const { blocks, labels, addrRange } = parse(source);
        this.#output = "";
        this.#pointer = 0;
        this.#addrRange = addrRange;
        this.#artifact.index = this.getAddrBoundary() + this.#artifact.size;
        this.#artifact.temp = this.#artifact.index + 1;
        this.#artifact.value = this.#artifact.index + 2;

        if (blocks.length > 255) throw new Error(`Block limit of ${255} reached: ${blocks.length} blocks`);

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

        return { output: this.#output, details: { blocks: blocks.length, addrRange: this.#addrRange } };
    }
}

export default AssemblySyntaxFactory;
