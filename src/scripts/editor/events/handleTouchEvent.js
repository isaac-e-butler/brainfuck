export function handleTouchEvent(editor, event) {
    event.stopPropagation();
    event.preventDefault();

    editor.debounceCursor();
    editor.resetReceiver();

    if (event.touches.length !== 2) return;

    navigator.clipboard
        .readText()
        .then((text) => {
            editor.insertText(text);
        })
        .catch((error) => {
            console.error("Error occurred while pasting via touch:", error);
        });
}
