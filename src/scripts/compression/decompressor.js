import { CustomSymbols } from "./symbol.js";

export class Decompressor {
    #symbol = new CustomSymbols();

    decompress(value) {
        const chunks = value.split(CustomSymbols.endSegment);

        if (Array.isArray(chunks) && chunks.length !== 2) {
            throw new Error("Segmentation fault");
        }

        const dictionary = this.#createBlockDictionary(chunks[0]);
        return this.#transcribe(chunks[1], dictionary);
    }

    #transcribe(value, dictionary) {
        const characters = Array.from(value);

        let prevChar = undefined;
        let readingPointerSymbol = false;
        let readingNumericSymbols = false;
        let numericSymbols = "";
        let escapeFlag = false;
        let skipFlag = false;
        let result = "";

        while (characters.length > 0) {
            const char = characters.shift();

            if (!escapeFlag && char === CustomSymbols.escape) {
                escapeFlag = true;
                continue;
            }

            if (!escapeFlag && this.#symbol.isNumericSymbol(char)) {
                readingNumericSymbols = true;
                numericSymbols += char;
                if (characters.length > 0) continue;
            }

            if (readingNumericSymbols && (!this.#symbol.isNumericSymbol(char) || characters.length === 0)) {
                const count = this.#symbol.fromNumericSymbols(numericSymbols);

                if (!Number.isSafeInteger(count)) {
                    throw new Error("Couldn't read number safely");
                }

                if (readingPointerSymbol) {
                    characters.unshift(...Array.from((dictionary.get(count) ?? "/SEGMENT_FAULT/") + char));
                    skipFlag = true;
                } else {
                    result += Array.from({ length: count - 1 }, () => prevChar).join("");
                    if (characters.length === 0) break;
                }

                readingPointerSymbol = false;
                readingNumericSymbols = false;
                numericSymbols = "";
            }

            if (!escapeFlag && char === CustomSymbols.pointer) {
                readingPointerSymbol = true;
                continue;
            }

            if (skipFlag) {
                skipFlag = false;
                continue;
            }

            escapeFlag = false;
            prevChar = char;
            result += char;
        }

        return result;
    }

    #createBlockDictionary(value) {
        return new Map(value.split(CustomSymbols.pointer).map((block, i) => [i, block]));
    }
}
