import { Compressor, Decompressor, Encoder } from "../compression/index.js";

const button = document.getElementById("share");
const icon = "./src/icons/actions/share.svg";

function share(state) {
    const text = state.editor.readText();
    if (!text) return;

    const compressedText = new Compressor().compress(text);
    const encodedText = new Encoder().encode(compressedText);

    const url = new URL(window.location.href);
    url.search = new URLSearchParams({ bf: encodedText });

    window.history.pushState("bf-file", "", url);
}

function loadPreviousShare(state) {
    const searchParams = new URLSearchParams(window.location.search);
    const encodedText = searchParams.get("bf");
    if (!encodedText) return;

    const decodedText = new Encoder().decode(encodedText);
    const decompressedText = new Decompressor().decompress(decodedText);

    state.editor.insertText(decompressedText);
}

export function initialise(state) {
    button.firstChild.src = icon;
    button.addEventListener("click", () => share(state));

    loadPreviousShare(state);
}
