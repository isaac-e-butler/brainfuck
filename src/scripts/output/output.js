export class Output {
    #container = document.getElementById("output");
    #content = [];

    clear() {
        this.#content = [];
        this.#container.replaceChildren();
    }

    add(value) {
        this.#content.push(value);

        const char = String.fromCharCode(value);
        this.#container.append(char);
    }
}
