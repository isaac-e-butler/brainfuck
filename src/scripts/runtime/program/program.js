import { syntax } from "./syntax.js";

class Program {
    #jumps = new Map();
    #program = "";
    #memory = [0];
    #pointer = 0;
    #counter = 0;

    #instructions = {
        [syntax.incrementPointer]: () => {
            this.#pointer++;
            this.#memory[this.#pointer] ??= 0;
        },
        [syntax.decrementPointer]: () => {
            if (this.#pointer === 0) {
                throw new Error(
                    `Memory underflow - instruction at position ${this.#counter + 1} moved the pointer below zero`,
                );
            }
            this.#pointer--;
        },
        [syntax.incrementValue]: () => {
            this.#memory[this.#pointer] = (this.getValue() + 1) & 255;
        },
        [syntax.decrementValue]: () => {
            this.#memory[this.#pointer] = (this.getValue() - 1) & 255;
        },
        [syntax.startLoop]: () => {
            if (this.getValue() === 0) {
                this.#counter = this.#jumps.get(this.#counter);
            }
        },
        [syntax.endLoop]: () => {
            if (this.getValue() !== 0) {
                this.#counter = this.#jumps.get(this.#counter);
            }
        },
        [syntax.output]: ({ output }) => output(this.getValue()),
        [syntax.input]: ({ input }) => input(),
    };

    load(program) {
        this.#pointer = 0;
        this.#counter = 0;
        this.#memory = [0];
        this.#program = program;
        this.#jumps = Program.#processJumps(program);
    }

    done() {
        return this.#counter >= this.#program.length;
    }

    continue(io) {
        const instruction = this.#program[this.#counter];

        if (instruction in this.#instructions) {
            this.#instructions[instruction](io);
        } else {
            console.warn(`Encountered unexpected instruction at position ${this.#counter + 1}`);
        }

        this.#counter++;
    }

    getValue(offset = 0) {
        return this.#memory[this.#pointer + offset];
    }

    setValue(value) {
        this.#memory[this.#pointer] = value;
    }

    static #processJumps(program) {
        const jumps = new Map();
        const openBrackets = [];

        for (let i = 0; i < program.length; i++) {
            if (program[i] === syntax.startLoop) {
                openBrackets.push(i);
            } else if (program[i] === syntax.endLoop) {
                if (openBrackets.length === 0) {
                    throw new Error(`Unexpected '${syntax.endLoop}' at position ${i + 1}`);
                }

                const start = openBrackets.pop();
                jumps.set(start, i).set(i, start);
            }
        }

        if (openBrackets.length > 0) {
            throw new Error(
                `Missing '${syntax.endLoop}' for '${syntax.startLoop}' at position ${openBrackets.at(-1) + 1}`,
            );
        }

        return jumps;
    }
}

export default Program;
