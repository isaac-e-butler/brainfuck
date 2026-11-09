export class Deflate {
    static #format = "deflate-raw";

    async compress(value) {
        if (!value) throw new Error("Failed to compress - nothing to compress");

        const stream = new Blob([value]).stream().pipeThrough(new CompressionStream(Deflate.#format));
        const bytes = new Uint8Array(await new Response(stream).arrayBuffer());

        return this.#toBase64Url(bytes);
    }

    async decompress(value) {
        if (!value) throw new Error("Failed to decompress - nothing to decompress");

        const bytes = this.#fromBase64Url(value);
        const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream(Deflate.#format));

        return new Response(stream).text();
    }

    #toBase64Url(bytes) {
        const binary = Array.from(bytes, (byte) => String.fromCharCode(byte)).join("");

        return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
    }

    #fromBase64Url(value) {
        const base64 = value.replaceAll("-", "+").replaceAll("_", "/");

        return Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
    }
}
