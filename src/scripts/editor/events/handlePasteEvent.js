export function handlePasteEvent(editor, event) {
    event.stopPropagation();
    event.preventDefault();

    if (event.target === input) return;

    const data = event.clipboardData.getData("text");

    for (const char of data) {
        const charCode = char.charCodeAt(0);

        switch (charCode) {
            case 13: {
                break;
            }
            case 10: {
                editor.insertLine();
                editor.moveCursor("down");
                break;
            }
            case 9: {
                editor.insertSpace(4);
                break;
            }
            case 32: {
                editor.insertSpace();
                break;
            }
            default: {
                editor.insertChar(char);
                break;
            }
        }
    }
}
