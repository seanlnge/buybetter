export type ReceiptText = {
    text: string
};

export type Alternative = {
    description: string,
    links?: {
        type: 'google' | 'amazon' | 'maps',
        query: string,
        link?: string,
        title?: string,
        description?: string,
    }[],

}
export type ReceiptPurpose = {
    purpose: string,
    alternatives: Alternative[]
};

export type ReceiptCacheItem = {
    birthTime: number,
    status: 'success' | 'error' | 'pending',
    errorMessage: string | null,
    chainProgress: 'reading' | 'analyzing' | 'searching' | 'complete',
    receiptText: ReceiptText | null,
    purposes: ReceiptPurpose[] | null
};

/**
 * Finds and returns first instance of completed JSON inside a string
 * @param str String that has JSON
 * @returns Valid JSON or null if no valid JSON found
 */
export function jsonParse(str: string) {
    let start = str.indexOf("{");
    if(start == -1) return undefined;

    let json = "";
    let depth = 0;

    for(let i=start; i<str.length; i++) {
        if(str[i] == "{") depth++;
        if(str[i] == "}") depth--;

        json += str[i];
        if(depth == 0) return JSON.parse(json);
    }

    return null;
}

export function toImageB64(buffer: Buffer, mimetype: string): string {
    return `data:${mimetype};base64,${buffer.toString('base64')}`;
}