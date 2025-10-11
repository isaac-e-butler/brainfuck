import { handleKeyEvent, handleMouseEvent, handlePasteEvent } from "./events/index.js";

class Editor {
    constructor() {
        this.content = document.createElement("div");
        this.content.className = "editor-content";

        this.status = document.createElement("div");
        this.status.className = "editor-status";

        this.cursor = document.createElement("div");
        this.cursor.className = "editor-cursor";
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

        const line = this.insertLine();
        line.appendChild(this.cursor);
        this.focus(line);

        this.container = document.getElementById("editor");
        this.container.appendChild(this.content);
        this.container.appendChild(this.status);

        this.content.addEventListener("paste", (event) => handlePasteEvent(this, event));
        this.content.addEventListener("keydown", (event) => handleKeyEvent(this, event));
        this.content.addEventListener("mousedown", (event) => handleMouseEvent(this, event));
    }

    insertLine() {
        const line = document.createElement("div");
        line.className = "line";
        line.tabIndex = -1;
        this.content.appendChild(line);

        return line;
    }

    removeLine(line) {
        if (!line) return;

        this.content.removeChild(line);
    }

    insertChar(value) {
        if (typeof value !== "string" || value.length !== 1) return;

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

    remove(line, direction) {
        if (!line) return;

        switch (direction) {
            case "left": {
                if (line.innerText.length > 0 && this.cursor.previousSibling !== null) {
                    this.cursor.previousSibling.remove();
                    this.cursorPosition.column -= 1;
                } else if (line.previousSibling !== null && line.innerText.length === 0) {
                    this.moveCursor("left");
                    this.removeLine(line);
                }
                break;
            }
            case "right": {
                if (line.innerText.length > 0 && this.cursor.nextSibling !== null) {
                    this.cursor.nextSibling.remove();
                } else if (line.nextSibling !== null && line.innerText.length === 0) {
                    this.moveCursor("down");
                    this.removeLine(line);
                }
                break;
            }
        }
    }

    focus(element) {
        if (!element) return;

        element.focus();
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

        this.cursorPosition.line = Array.from(this.content.childNodes).indexOf(line);
        this.focus(line);

        if (char) {
            this.cursorPosition.column = Array.from(line.childNodes).indexOf(char);
            line.insertBefore(this.cursor, line.childNodes[this.cursorPosition.column]);
        } else {
            this.cursorPosition.column = line.childNodes.length - 1;
            line.append(this.cursor);
        }
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

                this.focus(line.previousSibling);
                this.cursorPosition.line -= 1;
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

                this.focus(line.nextSibling);
                this.cursorPosition.line += 1;
                break;
            }
            case "left": {
                if (this.cursor.previousSibling !== null) {
                    line.insertBefore(this.cursor, this.cursor.previousSibling);

                    this.cursorPosition.column -= 1;
                } else if (line.previousSibling !== null) {
                    line.previousSibling.append(this.cursor);
                    this.focus(line.previousSibling);

                    this.cursorPosition.column = line.previousSibling.childNodes.length - 1;
                    this.cursorPosition.line -= 1;
                }
                break;
            }
            case "right": {
                if (this.cursor.nextSibling !== null) {
                    line.insertBefore(this.cursor.nextSibling, this.cursor);
                    this.cursorPosition.column += 1;
                } else if (line.nextSibling !== null) {
                    line.nextSibling.prepend(this.cursor);
                    this.focus(line.nextSibling);

                    this.cursorPosition.column = 0;
                    this.cursorPosition.line += 1;
                }
                break;
            }
        }
    }

    destroy() {
        this.container.removeChild(this.content);
    }
}

export default Editor;
