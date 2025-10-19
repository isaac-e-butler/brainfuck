export class Encoder {
    #bytes = "0123456789-_ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    #refBytes = Array.from(this.#bytes).reduce((result, byte, i) => result.set(byte, i), new Map());

    encode(value) {
        if (!value) {
            throw new Error("Cannot encode data without value");
        }

        let encodedValue = "";
        for (const char of value) {
            const code = char.charCodeAt(0);

            const iterationBit = this.#bytes[(code >> 6) & (this.#bytes.length - 1)];
            const valueBit = this.#bytes[code & (this.#bytes.length - 1)];

            encodedValue += iterationBit + valueBit;
        }

        return encodedValue;
    }

    decode(value) {
        if (!value) {
            throw new Error("Cannot decode data without value");
        }

        let decodedValue = "";
        for (let i = 0; i < value.length; i += 2) {
            const totalIterations = this.#refBytes.get(value[i]) << 6;
            const valueBit = this.#refBytes.get(value[i + 1]);

            decodedValue += String.fromCharCode(totalIterations + valueBit);
        }

        return decodedValue;
    }
}
