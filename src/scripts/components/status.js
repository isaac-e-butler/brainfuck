const container = document.getElementById("status");

function scrollToEnd() {
    container.scrollTo(0, container.scrollHeight);
}

function createLog(message, level) {
    const classList = [level];
    let innerText = message;

    if (typeof message === "object") {
        classList.push(message.style);
        innerText = message.text;
    }

    const log = document.createElement("span");
    log.classList.add(...classList);
    log.innerText = innerText;

    return log;
}

export function clear() {
    console.clear();

    container.replaceChildren();
}

export function addInfo(...messages) {
    console.log(...messages);

    for (const message of messages) {
        const log = createLog(message, "info");
        container.appendChild(log);
    }

    scrollToEnd();
}

export function addWarning(...messages) {
    console.warn(...messages);

    for (const message of messages) {
        const log = createLog(message, "warning");
        container.appendChild(log);
    }

    scrollToEnd();
}

export function addError(...messages) {
    console.error(...messages);

    for (const message of messages) {
        const log = createLog(message, "error");
        container.appendChild(log);
    }

    scrollToEnd();
}
