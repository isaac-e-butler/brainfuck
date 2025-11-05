export function createOptionButton({ id, disabled, src, children }) {
    const icon = document.createElement("img");
    icon.src = src;

    const button = document.createElement("button");
    button.className = "option-button";
    button.appendChild(icon);
    button.id = id;

    if (disabled) button.setAttribute("disabled", "true");
    if (children) button.append(...children);

    return button;
}
