const keyCodes = {
    enter: "Enter",
    backspace: "Backspace",
    delete: "Delete",
    arrowUp: "ArrowUp",
    arrowDown: "ArrowDown",
    arrowRight: "ArrowRight",
    arrowLeft: "ArrowLeft",
    space: "Space",
    tab: "Tab",
};

export function handleKeyEvent(editor, event) {
    if (event.ctrlKey || event.metaKey) return;

    editor.debounceCursor();

    switch (event.code) {
        case keyCodes.enter: {
            editor.insertLine();
            editor.moveCursor("down");
            break;
        }
        case keyCodes.backspace: {
            editor.remove(event.target, "left");
            break;
        }
        case keyCodes.delete: {
            editor.remove(event.target, "right");
            break;
        }
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
        case keyCodes.space: {
            event.preventDefault();
            editor.insertSpace();
            break;
        }
        default: {
            editor.insertChar(event.key);
            break;
        }
    }
}
