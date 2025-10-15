export function handlePasteClickEvent(editor, event) {
    event.stopPropagation();
    event.preventDefault();

    editor.debounceCursor();
    editor.resetReceiver();

    navigator.clipboard
        .readText()
        .then((text) => {
            editor.insertText(text);
        })
        .catch((error) => {
            console.error("Error occurred while pasting via touch:", error);
        });
}
