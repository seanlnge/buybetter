"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jsonParse = jsonParse;
exports.toImageB64 = toImageB64;
/**
 * Finds and returns first instance of completed JSON inside a string
 * @param str String that has JSON
 * @returns Valid JSON or null if no valid JSON found
 */
function jsonParse(str) {
    let start = str.indexOf("{");
    if (start == -1)
        return undefined;
    let json = "";
    let depth = 0;
    for (let i = start; i < str.length; i++) {
        if (str[i] == "{")
            depth++;
        if (str[i] == "}")
            depth--;
        json += str[i];
        if (depth == 0)
            return JSON.parse(json);
    }
    return null;
}
function toImageB64(buffer, mimetype) {
    return `data:${mimetype};base64,${buffer.toString('base64')}`;
}
