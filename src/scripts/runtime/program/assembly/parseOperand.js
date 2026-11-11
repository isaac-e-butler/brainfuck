const ESCAPED_CHAR_CODES = { n: 10, t: 9, r: 13, 0: 0, "\\": 92, "'": 39 };

function parseChar(value, lineNumber) {
    const char = value.slice(1, -1);
    const charCodeLength = [...char].length;
    let charCode;

    if (char.startsWith("\\")) {
        const escapeChar = char.slice(1);

        if (escapeChar in ESCAPED_CHAR_CODES) {
            charCode = ESCAPED_CHAR_CODES[escapeChar];
        } else if (escapeChar.length === 3 && escapeChar[0] === "x") {
            const hexValue = Number("0x" + escapeChar.slice(1));
            if (!isNaN(hexValue)) charCode = hexValue;
        }
    } else if (charCodeLength === 1) {
        charCode = char.codePointAt(0);
    }

    if (charCode === undefined) throw new Error(`Line ${lineNumber}: invalid character ${value}`);
    if (charCode > 255) throw new Error(`Line ${lineNumber}: character ${value} (${charCode}) is greater than 255`);

    return { kind: "value", value: charCode };
}

function parseAddr(value, lineNumber) {
    const addrChar = value.slice(1, -1);
    const addr = Number(addrChar);

    if (addrChar === "" || !Number.isInteger(addr) || addr < 0) {
        throw new Error(`Line ${lineNumber}: invalid address reference "${value}"`);
    }
    return { kind: "cell", value: addr };
}

function isValidLabel(value) {
    const isValidChar = (c) => (c >= "a" && c <= "z") || (c >= "A" && c <= "Z") || c === "_" || c === "-";
    const isValidDigit = (c) => c >= "0" && c <= "9";

    if (!value || !isValidChar(value.at(0))) return false;

    for (const char of value) {
        if (!isValidChar(char) && !isValidDigit(char)) return false;
    }
    return true;
}

export function parseOperand(operand, lineNumber) {
    const isAddr = operand.startsWith("[") && operand.endsWith("]");
    if (isAddr) return parseAddr(operand, lineNumber);

    const isChar = operand.length >= 3 && operand.startsWith("'") && operand.endsWith("'");
    if (isChar) return parseChar(operand, lineNumber);

    if (isValidLabel(operand)) return { kind: "label", value: operand };

    const value = Number(operand);
    if (isNaN(value))
        throw new Error(
            `Line ${lineNumber}: invalid operand "${operand}", expected an integer 0 to 255, a char 'X', an address [N], or a label`,
        );
    if (!Number.isInteger(value) || value < 0 || value > 255)
        throw new Error(`Line ${lineNumber}: value ${operand} must be an integer from 0 to 255`);

    return { kind: "value", value };
}
