export class Status {
    constructor() {
        this.container = document.getElementById("status");
    }

    #scrollToEnd() {
        this.container.scrollTo(0, this.container.scrollHeight);
    }

    #createLog(message, level) {
        const log = document.createElement("span");
        log.classList.add(level);
        log.innerText = message;
        return log;
    }

    clearLogs() {
        console.clear();

        this.container.replaceChildren();
    }

    attachInfo(...messages) {
        console.log(...messages);

        for (const message of messages) {
            const log = this.#createLog(message, "info");
            this.container.appendChild(log);
        }

        this.#scrollToEnd();
    }

    attachWarning(...messages) {
        console.warn(...messages);

        for (const message of messages) {
            const log = this.#createLog(message, "warning");
            this.container.appendChild(log);
        }

        this.#scrollToEnd();
    }

    attachError(...messages) {
        console.error(...messages);

        for (const message of messages) {
            const log = this.#createLog(message, "error");
            this.container.appendChild(log);
        }

        this.#scrollToEnd();
    }
}
