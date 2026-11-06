import { Compressor, Decompressor, Encoder } from "../../compression/index.js";
import { attachClickAnimation, createElement } from "../../helpers/index.js";

const icon = "./src/icons/actions/share.svg";

function share(state) {
    const text = state.editor.readText();
    if (!text) return;

    const compressedText = new Compressor().compress(text);
    const encodedText = new Encoder().encode(compressedText);
    const language = state.editor.activeLanguage?.toLowerCase() ?? "bf";

    const url = new URL(window.location.href);
    url.search = new URLSearchParams({ t: encodedText, l: language });

    window.history.pushState("shared-program", "", url);
}

function loadPreviousShare(state) {
    const searchParams = new URLSearchParams(window.location.search);

    const language = searchParams.get("l");
    if (language) {
        state.editor.setActiveLanguage(language);
    }

    const encodedText = searchParams.get("t");
    if (!encodedText) {
        state.editor.resetContent();
        return;
    }

    const decodedText = new Encoder().decode(encodedText);
    const decompressedText = new Decompressor().decompress(decodedText);

    state.editor.resetContent();
    state.editor.insertText(decompressedText);
}

export function initialise(parent, state) {
    const img = createElement("img", { src: icon, primitive: true });
    const button = createElement("button", {
        id: "share",
        class: "option-button",
        children: [img],
    });

    button.withElement((element) => {
        element.addEventListener("click", () => share(state));
        window.addEventListener("popstate", () => loadPreviousShare(state));

        loadPreviousShare(state);
        attachClickAnimation(element);
    });

    button.setParent(parent);
}
