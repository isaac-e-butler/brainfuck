export async function handleTouchEvent(editor, event) {
    event.stopPropagation();
    event.preventDefault();

    editor.debounceCursor();
    editor.resetReceiver();

    try {
        if (event.touches !== 2) return;

        const text = await navigator.clipboard.readText();
        this.insertText(text);
    } catch (error) {
        console.error("Error occurred while pasting via touch:", error);
    }
}
