import { attachActivationEvent } from "../helpers/index.js";

const form = document.getElementById("input-form");
const input = document.getElementById("input");
const submit = document.getElementById("input-submit");

const defaultPlaceholder = input.placeholder;
const activePlaceholder = "enter a value and press ↵";

export function focus() {
    form.classList.add("focus");
    input.placeholder = activePlaceholder;
    input.focus();
}

export function blur() {
    form.classList.remove("focus");
    input.placeholder = defaultPlaceholder;
    input.blur();
}

export function enable(callback) {
    if (callback) {
        form.addEventListener("submit", callback);
    }

    clear();
    focus();
}

export function clear() {
    form.reset();
}

export function disable(callback) {
    if (callback) {
        form.removeEventListener("submit", callback);
    }

    clear();
    blur();
}

export function initialise() {
    form.addEventListener("submit", (event) => event.preventDefault());
    attachActivationEvent(submit);
}
