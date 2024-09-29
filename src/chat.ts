import OpenAI from "openai";
import { jsonParse, ReceiptCacheItem, ReceiptPurpose, Alternative } from './utils';
import 'dotenv/config'
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";

const openai = new OpenAI({
    apiKey: process.env['OPENAI_API_KEY'],
});
const model = 'gpt-4o';

export async function ReceiptAlternatives(receiptText: string): Promise<Error | { chatHistory: ChatCompletionMessageParam[], purposes: ReceiptPurpose[] }> {
    const prefix = 'Here is a receipt for my recent purchase';
    const suffix = 'First, describe the purpose/purposes of my purchase, then give up to 3 alternative ways that I could complete these purpose(s) in a cheaper method, such as DIY, shopping in bulk, or shopping with cheaper means.';
    const schema = 'Respond to this in JSON according to the following schema: <json>{\n"receipt": { "purpose": string, "alternatives": string[] }[] }</json>\nIf there is only one main purpose, the purposes array should only be 1 element.';
    const text = prefix + '\n<receipt>\n' + receiptText + '\n</recipt>\n' + suffix + '\n' + schema;
    
    const modelChatHistory: ChatCompletionMessageParam[] = [{ role: 'user', content: [{ type: "text", text }] }];

    const resp = (await openai.chat.completions.create({
        messages: modelChatHistory,
        model,
        response_format: { type: "json_object" }
    }))?.choices[0]?.message?.content;

    const purposesUnparsed = resp ? jsonParse(resp)?.receipt : null;
    if(!purposesUnparsed) return new Error("error receiving OpenAI data");

    modelChatHistory.push({ role: 'assistant', content: [{ type: "text", text: resp! }] });
    const purposes: ReceiptPurpose[] = [];

    for(const purpose of purposesUnparsed) {
        purposes.push({
            purpose: purpose.purpose,
            alternatives: purpose.alternatives.map((x: string) => ({ description: x }))
        });
    }

    return {
        purposes: purposes,
        chatHistory: modelChatHistory
    };
}

export async function FindCheaper(receipt: ReceiptCacheItem, chatHistory: ChatCompletionMessageParam[]) {
    if(!receipt.purposes) return;

    const prefix = 'For each of the following alternatives to this purpose, give me google search queries, amazon search queries, or google maps search queries that I can use to complete the alternative.';
    const schema = '<json>{\n"alternatives": { "links": { "type": "google" | "amazon" | "maps", "query": string }[] }[] }</json>\nYou do not have to include every type of query, only the ones that make sense for the alternative given. The index of each alternative in the array must match up with the index of the given queries in your response';

    for(let i=0; i<receipt.purposes.length; i++) {
        const purpose = receipt.purposes[i];

        const text = prefix + '\n<purpose>\n' + JSON.stringify(purpose) + '\n</purpose>\nRespond to this in JSON according to the following schema:\n' + schema;

        const resp = (await openai.chat.completions.create({
            messages: [...chatHistory, { role: 'user', content: [{ type: 'text', text }] }],
            model,
            response_format: { type: "json_object" }
        }))?.choices[0]?.message?.content;

        const alternatives: any[] = resp ? jsonParse(resp)?.alternatives : null;
        if(!alternatives) return new Error("error receiving OpenAI data");

        purpose.alternatives.forEach((alt, i) => {
            alt.links = alternatives[i]!.links as Alternative["links"];
        });
    }
}