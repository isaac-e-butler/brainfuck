export function handleMouseEvent(editor, event) {
    event.stopPropagation();
    event.preventDefault();

    editor.debounceCursor();
    editor.moveCursorTo(event.target);
}
