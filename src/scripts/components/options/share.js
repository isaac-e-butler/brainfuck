import { Deflate } from "../../compression/index.js";
import { attachClickAnimation, createElement } from "../../helpers/index.js";

const icon = "./src/icons/actions/share.svg";

async function share(state) {
    const text = state.editor.readText();
    if (!text) return;

    const language = state.editor.activeLanguage?.toLowerCase() ?? "bf";
    const compressedText = await new Deflate().compress(text);

    const url = new URL(window.location.href);
    url.search = new URLSearchParams({ c: compressedText, l: language });

    window.history.pushState("shared-program", "", url);
}

let latestLoad = 0;

async function loadPreviousShare(state) {
    const load = ++latestLoad;
    const searchParams = new URLSearchParams(window.location.search);

    const language = searchParams.get("l");
    if (language) {
        state.editor.setActiveLanguage(language);
    }

    const compressedText = searchParams.get("c");

    try {
        const sharedText = compressedText && (await new Deflate().decompress(compressedText));
        if (load !== latestLoad) return;

        state.editor.resetContent();
        if (sharedText) {
            state.editor.insertText(sharedText);
        }
    } catch (error) {
        console.error("Failed to load program from URL", error);
    }
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
