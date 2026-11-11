export function tokenise(raw, lineNumber) {
    const tokens = [];
    let currentToken = "";
    let insideQuote = false;

    function pushTokenAndReset() {
        if (currentToken) tokens.push(currentToken);
        currentToken = "";
    }

    for (let i = 0; i < raw.length; i++) {
        const char = raw[i];

        if (insideQuote) {
            currentToken += char;

            if (char === "\\" && i + 1 < raw.length) currentToken += raw[++i];
            else if (char === "'") insideQuote = false;

            continue;
        }

        if (char === ";") break;
        if (char === "'") insideQuote = true;

        if (char === " " || char === "\t") pushTokenAndReset();
        else currentToken += char;
    }

    if (insideQuote) throw new Error(`Line ${lineNumber}: unterminated character`);
    pushTokenAndReset();

    return tokens;
}
