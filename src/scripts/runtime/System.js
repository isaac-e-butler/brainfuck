class System {
    constructor() {
        this.memory = [0];
        this.pointer = 0;
        this.counter = 0;
        this.stack = [];
    }

    incrementPointer() {
        if (typeof this.memory[this.pointer + 1] !== "number") {
            this.memory[this.pointer + 1] = 0;
        }

        this.pointer++;
    }

    decrementPointer() {
        this.pointer--;

        if (this.pointer < 0) {
            throw new Error("memory overflow: pointer below 0");
        }
    }

    incrementValue() {
        this.memory[this.pointer]++;
    }

    decrementValue() {
        this.memory[this.pointer]--;
    }

    startLoop() {
        this.stack.push({ counter: this.counter });
    }

    endLoop() {
        const stack = this.stack[this.stack.length - 1];

        if (this.memory[this.pointer] > 0) {
            this.counter = stack.counter;
        } else {
            this.stack.pop();
        }
    }

    getValueAtPointer() {
        return this.memory[this.pointer];
    }

    setValueAtPointer(value) {
        this.memory[this.pointer] = value;
    }

    incrementCounter() {
        this.counter++;
    }
}

export default System;
