export async function handleCopyClickEvent(editor, event) {
    event.stopPropagation();
    event.preventDefault();

    try {
        const text = editor.readText();
        await navigator.clipboard.writeText(text);
    } catch (error) {
        console.error("Error occurred while copying:", error);
    }
}
