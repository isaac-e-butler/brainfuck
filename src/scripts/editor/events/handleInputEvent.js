const inputTypes = {
    text: "insertText",
    enter: "insertLineBreak",
    delete: "deleteContentForward",
    backspace: "deleteContentBackward",
};

export function handleInputEvent(editor, event) {
    event.preventDefault();

    editor.debounceCursor();
    editor.resetReceiver();

    switch (event.inputType) {
        case inputTypes.enter: {
            editor.insertLine();
            editor.moveCursor("right");
            break;
        }
        case inputTypes.text: {
            if (event.data === " ") {
                editor.insertSpace();
            } else {
                editor.insertChar(event.data);
            }
            break;
        }
        case inputTypes.backspace: {
            editor.remove("left");
            break;
        }
        case inputTypes.delete: {
            editor.remove("right");
            break;
        }
        default: {
            editor.insertChar(event.data);
            break;
        }
    }
}
