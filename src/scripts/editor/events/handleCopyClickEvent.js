export async function handleCopyClickEvent(editor, event) {
    event.stopPropagation();
    event.preventDefault();

    const lines = editor.content.getElementsByClassName("line");
    const text = Array.from(lines).reduce((result, line) => {
        for (const char of line.children) {
            result += char.innerText;
        }

        return result + "\n";
    }, "");

    try {
        await navigator.clipboard.writeText(text);
    } catch (error) {
        console.error("Error occurred while copying:", error);
    }
}
