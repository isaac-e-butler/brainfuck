import { CustomSymbols } from "./symbol.js";

export class Compressor {
    #symbol = new CustomSymbols();

    compress(value) {
        const blocks = this.#compressToBlocks(value);
        const dictionary = this.#createBlockDictionary(blocks);

        return (
            Array.from(dictionary.keys()).join(CustomSymbols.pointer) +
            CustomSymbols.endSegment +
            blocks
                .map((block) => {
                    if (dictionary.has(block)) {
                        return `${CustomSymbols.pointer}${dictionary.get(block)}`;
                    }

                    return block;
                })
                .join("")
        );
    }

    #createBlockDictionary(blocks) {
        const blockDistribution = blocks
            .reduce((result, block) => {
                const frequency = result.get(block) ?? 0;
                return result.set(block, frequency + 1);
            }, new Map())
            .entries();

        return Array.from(blockDistribution)
            .filter(([key, count]) => key.length > 2 && count > 1)
            .sort(([keyA, countA], [KeyB, countB]) => {
                return countB * KeyB.length - countA * keyA.length;
            })
            .filter(([key, count], i) => {
                const compressedSize = key.length + 1 + (this.#symbol.toNumericSymbols(i).length + 1) * count;
                const uncompressedSize = key.length * count;

                return uncompressedSize > compressedSize;
            })
            .reduce((result, [key], i) => result.set(key, this.#symbol.toNumericSymbols(i)), new Map());
    }

    #compressToBlocks(value) {
        const separators = new Set([" ", "\n", "\t"]);

        let prevChar = value[0];
        let current = { value: prevChar, count: 1 };
        const blocks = [];
        let block = "";

        for (let i = 1; i < value.length; i++) {
            const char = value[i];

            if (char !== prevChar) {
                block += this.#createBlock(current);
                current = { value: char, count: 1 };

                if (separators.has(prevChar) || separators.has(char)) {
                    blocks.push(block);
                    block = "";
                }
            } else {
                current.count++;

                if (value.length === i + 1) {
                    block += this.#createBlock(current);
                    blocks.push(block);
                    break;
                }
            }

            prevChar = char;
        }

        return blocks;
    }

    #createBlock(current) {
        const { value, count } = current;

        if (this.#symbol.isSymbol(value))
            return Array.from({ length: count }, () => {
                return `${CustomSymbols.escape}${value}`;
            }).join("");

        return count > 2
            ? `${value}${this.#symbol.toNumericSymbols(count)}`
            : Array.from({ length: count }, () => value).join("");
    }
}
