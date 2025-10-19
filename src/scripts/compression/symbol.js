export class CustomSymbols {
    static pointer = String.fromCharCode(26);
    static escape = String.fromCharCode(27);
    static endSegment = String.fromCharCode(29);

    constructor() {
        this.numericSymbols = this.#createSymbols();
        this.controlSymbols = new Set()
            .add(CustomSymbols.pointer)
            .add(CustomSymbols.escape)
            .add(CustomSymbols.endSegment);
        this.allSymbols = new Set(this.numericSymbols.list)
            .add(CustomSymbols.pointer)
            .add(CustomSymbols.escape)
            .add(CustomSymbols.endSegment);
    }

    toNumericSymbols(value) {
        if (value === 0) return this.numericSymbols[0];

        const base = this.numericSymbols.list.size;
        const digits = Math.floor(Math.log(value) / Math.log(base)) + 1;

        return Array.from({ length: digits }, (_, i) => {
            const power = digits - i - 1;
            const digit = Math.floor(value / Math.pow(base, power)) % base;
            return this.numericSymbols[digit];
        }).join("");
    }

    fromNumericSymbols(value) {
        return Array.from(value)
            .reverse()
            .reduce((result, symbol, i) => {
                return result + this.numericSymbols.list.size ** i * this.numericSymbols[symbol];
            }, 0);
    }

    isNumericSymbol(value) {
        return this.numericSymbols.list.has(value);
    }

    isControlSymbol(value) {
        return this.controlSymbols.has(value);
    }

    isSymbol(value) {
        return this.allSymbols.has(value);
    }

    #createSymbols() {
        const nonPrintableCodes = [
            0, 1, 2, 3, 4, 5, 6, 7, 11, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 28, 30, 31,
        ];

        return nonPrintableCodes.reduce(
            (result, code, i) => {
                const symbol = String.fromCharCode(code);
                result.list.add(symbol);

                return { ...result, [i]: symbol, [symbol]: i };
            },
            { list: new Set() }
        );
    }
}
