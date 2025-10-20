export class Status {
    #container = document.getElementById("status");

    #scrollToEnd() {
        this.#container.scrollTo(0, this.#container.scrollHeight);
    }

    #createLog(message, level) {
        const log = document.createElement("span");
        log.classList.add(level);
        log.innerText = message;
        return log;
    }

    clear() {
        console.clear();

        this.#container.replaceChildren();
    }

    addInfo(...messages) {
        console.log(...messages);

        for (const message of messages) {
            const log = this.#createLog(message, "info");
            this.#container.appendChild(log);
        }

        this.#scrollToEnd();
    }

    addWarning(...messages) {
        console.warn(...messages);

        for (const message of messages) {
            const log = this.#createLog(message, "warning");
            this.#container.appendChild(log);
        }

        this.#scrollToEnd();
    }

    addError(...messages) {
        console.error(...messages);

        for (const message of messages) {
            const log = this.#createLog(message, "error");
            this.#container.appendChild(log);
        }

        this.#scrollToEnd();
    }
}
