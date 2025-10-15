export function handlePasteEvent(editor, event) {
    event.stopPropagation();
    event.preventDefault();

    editor.debounceCursor();
    editor.resetReceiver();

    const text = event.clipboardData.getData("text");
    editor.insertText(text);
}
