const container = document.createElement("div");
let afterEffect = undefined;
let active = false;

export function open(props) {
    if (active) {
        console.warn("Cannot open more than one modal instance");
        return;
    }

    const { parent, action, titleText, confirmText, cancelText, destructive } = props;
    afterEffect = props.afterEffect;
    active = true;

    container.className = "editor-modal-container";

    const title = document.createElement("div");
    title.className = "editor-modal-title";
    title.append(titleText);

    const confirmButton = document.createElement("button");
    confirmButton.className = "editor-modal-confirm";
    if (destructive) {
        confirmButton.classList.add("destructive");
    }
    confirmButton.append(confirmText);

    const cancelButton = document.createElement("button");
    cancelButton.className = "editor-modal-cancel";
    cancelButton.append(cancelText);

    const buttons = document.createElement("div");
    buttons.className = "editor-modal-buttons";
    buttons.append(confirmButton, cancelButton);

    window.addEventListener("popstate", () => close(), { once: true });
    cancelButton.addEventListener("click", () => close(), { once: true });
    confirmButton.addEventListener(
        "click",
        () => {
            action();
            close();
        },
        { once: true }
    );

    const modal = document.createElement("div");
    modal.className = "editor-modal border";
    modal.append(title, buttons);
    container.appendChild(modal);
    parent.appendChild(container);
}

export function close() {
    if (!active) return;

    const parent = container.parentElement;
    container.replaceChildren();
    parent.removeChild(container);

    active = false;
    afterEffect?.call();
}
