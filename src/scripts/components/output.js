const container = document.getElementById("output");
let content = [];

export function clear() {
    content = [];
    container.replaceChildren();
}

export function add(value) {
    content.push(value);

    const char = String.fromCharCode(value);
    container.append(char);
}
