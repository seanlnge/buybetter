import OpenAI from "openai";
import { jsonParse, ReceiptPurpose } from "./utils";
import 'dotenv/config'

const openai = new OpenAI({
    apiKey: process.env['OPENAI_API_KEY'],
});

export async function ReceiptAlternatives(receiptText: string): Promise<Error | ReceiptPurpose[]> {
    const model = 'gpt-4o';
    const prefix = 'Here is a receipt for my recent purchase';
    const suffix = 'First, describe the purpose/purposes of my purchase, then give up to 3 alternative ways that I could complete these purpose(s) in a cheaper method, such as DIY, shopping in bulk, or shopping with cheaper means.';
    const schema = 'Respond to this in JSON according to the following schema: <json>{\n"receipt": { "purpose": string, "alternatives": string[] }[] }</json>\nIf there is only one main purpose, the purposes array should only be 1 element.';
    const text = prefix + '\n<receipt>\n' + receiptText + '\n</recipt>\n' + suffix + '\n' + schema;

    const resp = (await openai.chat.completions.create({
        messages: [
            { role: 'user', content: [{ type: "text", text }] }
        ],
        model,
        response_format: { type: "json_object" }
    }))?.choices[0]?.message?.content;

    const purposes = resp ? jsonParse(resp)?.receipt : null;
    if(!purposes) return new Error("error receiving OpenAI data");
    return purposes as ReceiptPurpose[];
}