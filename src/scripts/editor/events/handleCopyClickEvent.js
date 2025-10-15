export async function handleCopyClickEvent(editor, event) {
    event.stopPropagation();
    event.preventDefault();

    const lines = editor.content.getElementsByClassName("line");
    const text = Array.from(lines).reduce((result, line) => {
        for (const char of line.children) {
            if (char.classList.contains("char")) {
                result += char.innerText;
            } else if (char.classList.contains("space")) {
                result += " ";
            } else if (char.classList.contains("tab")) {
                result += "\t";
            }
        }

        return result + "\n";
    }, "");

    try {
        await navigator.clipboard.writeText(text);
    } catch (error) {
        console.error("Error occurred while copying:", error);
    }
}
