import { attachActivationEvent } from "../helpers/index.js";

export class Input {
    #form = document.getElementById("input-form");
    #input = document.getElementById("input");
    #submit = document.getElementById("input-submit");

    #defaultPlaceholder = this.#input.placeholder;

    constructor() {
        attachActivationEvent(this.#submit);
        this.#form.addEventListener("submit", (event) => event.preventDefault());
    }

    focus() {
        this.#form.classList.add("focus");
        this.#input.placeholder = "enter a value and press ↵";
        this.#input.focus();
    }

    blur() {
        this.#form.classList.remove("focus");
        this.#input.placeholder = this.#defaultPlaceholder;
        this.#input.blur();
    }

    enable(callback) {
        this.#form.addEventListener("submit", callback);
        this.clear();
        this.focus();
    }

    clear() {
        this.#form.reset();
    }

    disable(callback) {
        this.#form.removeEventListener("submit", callback);
        this.clear();
        this.blur();
    }
}
