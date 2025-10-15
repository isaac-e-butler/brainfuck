export async function handlePasteClickEvent(editor, event) {
    event.stopPropagation();
    event.preventDefault();

    editor.debounceCursor();
    editor.resetReceiver();

    try {
        const text = await navigator.clipboard.readText();
        editor.insertText(text);
    } catch (error) {
        console.error("Error occurred while pasting:", error);
    }
}
