const keyCodes = {
    arrowUp: "ArrowUp",
    arrowDown: "ArrowDown",
    arrowRight: "ArrowRight",
    arrowLeft: "ArrowLeft",
    tab: "Tab",
};

export function handleKeyEvent(editor, event) {
    if (event.ctrlKey || event.metaKey) return;

    editor.debounceCursor();
    editor.resetReceiver();

    switch (event.code) {
        case keyCodes.arrowUp: {
            event.preventDefault();
            editor.moveCursor("up");
            break;
        }
        case keyCodes.arrowDown: {
            event.preventDefault();
            editor.moveCursor("down");
            break;
        }
        case keyCodes.arrowLeft: {
            event.preventDefault();
            editor.moveCursor("left");
            break;
        }
        case keyCodes.arrowRight: {
            event.preventDefault();
            editor.moveCursor("right");
            break;
        }
        case keyCodes.tab: {
            event.preventDefault();
            editor.insertSpace(4);
            break;
        }
    }
}
