export function handleMouseEvent(editor, event) {
    editor.debounceCursor();
    editor.moveCursorTo(event.target);
}
