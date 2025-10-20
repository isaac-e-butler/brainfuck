import { CustomSymbols } from "./symbol.js";

export class Decompressor {
    #symbol = new CustomSymbols();

    decompress(value) {
        const chunks = value.split(CustomSymbols.endSegment);

        if (Array.isArray(chunks) && chunks.length !== 2) {
            throw new Error(`Failed to decompress: Expected '2' chunks but received '${chunks.length}'`);
        }

        const dictionary = this.#createBlockDictionary(chunks[0]);
        return this.transcribe(chunks[1], dictionary);
    }

    transcribe(value, dictionary, prevState) {
        const characters = Array.from(value);
        characters.push(CustomSymbols.endSegment);

        const blocks = [];
        const state = prevState ?? {
            prevChar: undefined,
            readingPointerSymbol: false,
            readingNumericSymbols: false,
            numericSymbols: "",
            escapeFlag: false,
        };

        for (let i = 0; i < characters.length; i++) {
            const char = characters[i];

            if (!state.escapeFlag && char === CustomSymbols.escape) {
                state.escapeFlag = true;
                continue;
            }

            if (!state.escapeFlag && this.#symbol.isNumericSymbol(char)) {
                state.readingNumericSymbols = true;
                state.numericSymbols += char;
                continue;
            }

            if (state.readingNumericSymbols && !this.#symbol.isNumericSymbol(char)) {
                const count = this.#symbol.fromNumericSymbols(state.numericSymbols);

                if (!Number.isSafeInteger(count)) {
                    throw new Error("Couldn't read number safely");
                }

                const block = state.readingPointerSymbol
                    ? this.transcribe(dictionary.get(count) ?? "/SEGMENT_FAULT/", dictionary, prevState)
                    : Array.from({ length: count - 1 }, () => state.prevChar).join("");
                blocks.push(block);

                state.readingPointerSymbol = false;
                state.readingNumericSymbols = false;
                state.numericSymbols = "";
            }

            if (!state.escapeFlag && char === CustomSymbols.pointer) {
                state.readingPointerSymbol = true;
                continue;
            }

            state.escapeFlag = false;
            state.prevChar = char;
            blocks.push(char);
        }

        return blocks.join("");
    }

    #createBlockDictionary(value) {
        return new Map(value.split(CustomSymbols.pointer).map((block, i) => [i, block]));
    }
}
