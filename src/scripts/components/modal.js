import { createElement } from "../helpers/element.js";

const container = createElement("div", { class: "editor-modal-container" });
let afterEffect = undefined;
let active = false;

export function open(props) {
    if (active) close();

    const { parent, action, titleText, confirmText, cancelText, destructive } = props;
    afterEffect = props.afterEffect;
    active = true;

    const title = createElement("div", {
        class: "editor-modal-title",
        children: [titleText],
    });

    const confirmButton = createElement("button", {
        class: "editor-modal-confirm",
        children: [confirmText],
    })
        .addClass("destructive", destructive)
        .withElement((btn) =>
            btn.addEventListener(
                "click",
                () => {
                    action();
                    close();
                },
                { once: true },
            ),
        );

    const cancelButton = createElement("button", {
        class: "editor-modal-cancel",
        children: [cancelText],
    }).withElement((btn) => btn.addEventListener("click", () => close(), { once: true }));
    window.addEventListener("popstate", () => close(), { once: true });

    const buttons = createElement("div", {
        class: "editor-modal-buttons",
        children: [confirmButton, cancelButton],
    });

    const modal = createElement("div", {
        class: "editor-modal border",
        children: [title, buttons],
    });
    container.addChildren([modal]).setParent(parent);
}

export function close() {
    if (!active) return;

    container.removeAllChildren().removeSelf();

    active = false;
    afterEffect?.call();
}
