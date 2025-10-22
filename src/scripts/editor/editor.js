import { handleInputEvent, handleKeyEvent, handleMouseEvent, handlePasteEvent } from "./events/index.js";

export class Editor {
    constructor() {
        this.lines = document.createElement("div");
        this.lines.className = "editor-lines";

        this.lineNumbers = document.createElement("div");
        this.lineNumbers.className = "editor-line-numbers";

        this.content = document.createElement("div");
        this.content.className = "editor-content";
        this.content.appendChild(this.lineNumbers);
        this.content.appendChild(this.lines);

        this.status = document.createElement("div");
        this.status.className = "editor-status";

        this.inputReceiver = document.createElement("textarea");
        this.inputReceiver.className = "cursor-input-receiver";
        this.inputReceiver.id = "cursor-input-receiver";

        this.cursor = document.createElement("div");
        this.cursor.className = "editor-cursor";
        this.cursor.appendChild(this.inputReceiver);

        this.cursorPosition = new Proxy(
            {
                line: 0,
                column: 0,
                toString() {
                    return `Ln ${this.line + 1}, Col ${this.column + 1}`;
                },
            },
            {
                set: (cursorPosition, prop, value) => {
                    if (typeof cursorPosition[prop] === "number") {
                        const result = Reflect.set(cursorPosition, prop, value >= 0 ? value : 0);
                        this.cursorPositionStatus.innerText = this.cursorPosition.toString();

                        return result;
                    }
                },
            }
        );

        this.cursorAnimationTimeout = undefined;
        this.cursorAnimationDurationMS = 500;
        this.cursorAnimation = this.cursor.animate(
            [
                {
                    opacity: 1,
                },
                {
                    opacity: 0,
                },
            ],
            {
                iterations: Infinity,
                duration: this.cursorAnimationDurationMS,
                direction: "alternate",
                easing: "cubic-bezier(1, 0, 0, 1)",
            }
        );

        this.cursorPositionStatus = document.createElement("div");
        this.cursorPositionStatus.className = "editor-status-text";
        this.cursorPositionStatus.innerText = this.cursorPosition.toString();
        this.status.appendChild(this.cursorPositionStatus);

        const [lineNumber, line] = this.insertLine();
        this.focusedLineNumber = lineNumber;
        this.focusedLine = line;
        this.focus();

        this.container = document.getElementById("editor");
        this.container.appendChild(this.content);
        this.container.appendChild(this.status);

        this.lines.addEventListener("mousedown", (event) => handleMouseEvent(this, event));
        this.inputReceiver.addEventListener("paste", (event) => handlePasteEvent(this, event));
        this.inputReceiver.addEventListener("keydown", (event) => handleKeyEvent(this, event));
        this.inputReceiver.addEventListener("input", (event) => handleInputEvent(this, event));
        this.inputReceiver.addEventListener("focus", () => this.focus());
        this.inputReceiver.addEventListener("blur", () => this.blur());

        this.focusAtCursor();
    }

    insertText(text) {
        for (const char of text) {
            const charCode = char.charCodeAt(0);

            switch (charCode) {
                case 13: {
                    break;
                }
                case 10: {
                    this.insertLine();
                    this.moveCursor("down");
                    break;
                }
                case 9: {
                    this.insertSpace(4);
                    break;
                }
                case 32: {
                    this.insertSpace();
                    break;
                }
                default: {
                    if (charCode > 32) this.insertChar(char);
                    break;
                }
            }
        }
    }

    readText() {
        const lines = this.content.getElementsByClassName("line");
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

        return text;
    }

    resetContent() {
        const firstLineNumber = this.lineNumbers.firstChild;
        const firstLine = this.lines.firstChild;

        this.moveCursorTo(firstLine.firstChild);
        this.focus(firstLine);

        this.lineNumbers.replaceChildren(firstLineNumber);
        this.lines.replaceChildren(firstLine);
        firstLine.replaceChildren(this.cursor);

        this.focusAtCursor();
    }

    insertLine() {
        const lineNumber = document.createElement("div");
        lineNumber.className = "line-number";
        lineNumber.tabIndex = -1;
        this.lineNumbers.appendChild(lineNumber);

        const line = document.createElement("div");
        line.className = "line";
        line.tabIndex = -1;

        if (this.cursor.parentElement) {
            const currentLine = this.cursor.parentElement;
            currentLine.insertAdjacentElement("afterend", line);

            const childrenAfterCursor = Array.from(currentLine.childNodes).splice(this.cursorPosition.column + 1);
            line.append(...childrenAfterCursor);
        } else {
            line.appendChild(this.cursor);
            this.lines.appendChild(line);
        }

        return [lineNumber, line];
    }

    removeLine(line) {
        if (!line) return;

        const lineNumber = this.lineNumbers.childNodes[this.cursorPosition.line];
        this.lineNumbers.removeChild(lineNumber);
        this.lines.removeChild(line);
    }

    insertChar(value) {
        if (typeof value !== "string") return;

        value = value.trim();

        if (!value || value.length > 1) return;

        const char = document.createElement("div");
        char.className = "char";
        char.innerText = value;

        this.cursor.insertAdjacentElement("afterend", char);
        this.moveCursor("right");
    }

    insertSpace(length = 1) {
        if (typeof length !== "number" || length <= 0) return;

        const space = document.createElement("div");
        space.className = length === 1 ? "space" : "tab";
        space.innerText = Array.from({ length: length }, () => {
            return String.fromCharCode(160);
        }).join("");

        this.cursor.insertAdjacentElement("afterend", space);
        this.moveCursor("right");
    }

    remove(direction) {
        const line = this.cursor.parentElement;

        switch (direction) {
            case "left": {
                if (line.innerText.length > 0 && this.cursor.previousSibling !== null) {
                    this.cursor.previousSibling.remove();
                    this.cursorPosition.column -= 1;
                } else if (line.previousSibling !== null && this.cursor.previousSibling === null) {
                    const childrenAfterCursor = Array.from(line.childNodes).splice(this.cursorPosition.column + 1);

                    this.moveCursor("left");
                    line.previousSibling.append(...childrenAfterCursor);
                    this.removeLine(line);
                }
                break;
            }
            case "right": {
                if (line.innerText.length > 0 && this.cursor.nextSibling !== null) {
                    this.cursor.nextSibling.remove();
                } else if (line.nextSibling !== null && this.cursor.nextSibling === null) {
                    const childrenBelow = Array.from(line.nextSibling.childNodes);

                    this.focus(line);
                    line.append(...childrenBelow);
                    this.removeLine(line.nextSibling);
                }
                break;
            }
        }

        this.focusAtCursor();
    }

    focus(line) {
        if (line) {
            this.focusedLine.classList.remove("line-focused");
            this.focusedLine = line;
        }
        this.focusedLine.classList.add("line-focused");

        setTimeout(() => {
            if (line) {
                this.focusedLineNumber.classList.remove("line-focused");
                this.focusedLineNumber = this.lineNumbers.childNodes[this.cursorPosition.line];
            }
            this.focusedLineNumber.classList.add("line-focused");
        }, 0);
    }

    blur() {
        this.focusedLineNumber.classList.remove("line-focused");
        this.focusedLine.classList.remove("line-focused");
    }

    resetReceiver() {
        this.inputReceiver.value = "\u200B" + "\u200B";
        this.inputReceiver.setSelectionRange(1, 1);
    }

    focusAtCursor() {
        this.inputReceiver.focus();
    }

    debounceCursor() {
        this.cursorAnimation.pause();
        this.cursorAnimation.currentTime = 0;

        clearTimeout(this.cursor.cursorAnimationTimeout);

        this.cursor.cursorAnimationTimeout = setTimeout(() => {
            this.cursorAnimation.play();
        }, this.cursorAnimationDurationMS / 2);
    }

    moveCursorTo(element) {
        if (!element) return;

        const line = element.classList.contains("line") ? element : element.parentElement;
        const char = element.classList.contains("char") ? element : null;

        if (!line || !line.classList.contains("line")) return;

        this.cursorPosition.line = Array.from(this.lines.childNodes).indexOf(line);
        this.focus(line);

        if (char) {
            const indexOfChar = Array.from(line.childNodes).indexOf(char);

            const shouldOffsetCursor = this.cursorPosition.column <= indexOfChar;
            this.cursorPosition.column = shouldOffsetCursor ? indexOfChar - 1 : indexOfChar;

            line.insertBefore(this.cursor, line.childNodes[indexOfChar]);
        } else {
            this.cursorPosition.column = line.childNodes.length - 1;
            line.append(this.cursor);
        }

        this.focusAtCursor();
    }

    moveCursor(direction = undefined) {
        const line = this.cursor.parentElement;

        switch (direction) {
            case "up": {
                if (!line.previousSibling) break;
                const lineAbove = line.previousSibling.childNodes;

                if (this.cursorPosition.column > lineAbove.length - 1) {
                    line.previousSibling.append(this.cursor);

                    this.cursorPosition.column = lineAbove.length - 1;
                } else {
                    line.previousSibling.insertBefore(this.cursor, lineAbove[this.cursorPosition.column]);
                }

                this.cursorPosition.line -= 1;
                this.focus(line.previousSibling);
                break;
            }
            case "down": {
                if (!line.nextSibling) break;
                const lineBelow = line.nextSibling.childNodes;

                if (this.cursorPosition.column > lineBelow.length - 1) {
                    line.nextSibling.append(this.cursor);

                    this.cursorPosition.column = lineBelow.length - 1;
                } else {
                    line.nextSibling.insertBefore(this.cursor, lineBelow[this.cursorPosition.column]);
                }

                this.cursorPosition.line += 1;
                this.focus(line.nextSibling);
                break;
            }
            case "left": {
                if (this.cursor.previousSibling !== null) {
                    line.insertBefore(this.cursor, this.cursor.previousSibling);

                    this.cursorPosition.column -= 1;
                } else if (line.previousSibling !== null) {
                    line.previousSibling.append(this.cursor);

                    this.cursorPosition.line -= 1;
                    this.cursorPosition.column = line.previousSibling.childNodes.length - 1;

                    this.focus(line.previousSibling);
                }
                break;
            }
            case "right": {
                if (this.cursor.nextSibling !== null) {
                    line.insertBefore(this.cursor.nextSibling, this.cursor);
                    this.cursorPosition.column += 1;
                } else if (line.nextSibling !== null) {
                    line.nextSibling.prepend(this.cursor);

                    this.cursorPosition.column = 0;
                    this.cursorPosition.line += 1;

                    this.focus(line.nextSibling);
                }
                break;
            }
        }

        this.focusAtCursor();
    }
}
