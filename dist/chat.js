"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReceiptAlternatives = ReceiptAlternatives;
exports.FindCheaper = FindCheaper;
const openai_1 = __importDefault(require("openai"));
const utils_1 = require("./utils");
require("dotenv/config");
const openai = new openai_1.default({
    apiKey: process.env['OPENAI_API_KEY'],
});
const model = 'gpt-4o';
function ReceiptAlternatives(receiptText) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d;
        const prefix = 'Here is a receipt for my recent purchase';
        const suffix = 'First, describe the purpose/purposes of my purchase in 1 to 2 sentences, then give up to 3 alternative ways that I could complete these purpose(s) in a cheaper method, such as DIY, shopping in bulk, or shopping with cheaper means.';
        const schema = 'Respond to this in JSON according to the following schema: <json>{\n"receipt": { "purpose": string, "alternatives": string[] }[] }</json>\nIf there is only one main purpose, the purposes array should only be 1 element.';
        const text = prefix + '\n<receipt>\n' + receiptText + '\n</recipt>\n' + suffix + '\n' + schema;
        const modelChatHistory = [{ role: 'user', content: [{ type: "text", text }] }];
        const resp = (_c = (_b = (_a = (yield openai.chat.completions.create({
            messages: modelChatHistory,
            model,
            response_format: { type: "json_object" }
        }))) === null || _a === void 0 ? void 0 : _a.choices[0]) === null || _b === void 0 ? void 0 : _b.message) === null || _c === void 0 ? void 0 : _c.content;
        const purposesUnparsed = resp ? (_d = (0, utils_1.jsonParse)(resp)) === null || _d === void 0 ? void 0 : _d.receipt : null;
        if (!purposesUnparsed)
            return new Error("error receiving OpenAI data");
        modelChatHistory.push({ role: 'assistant', content: [{ type: "text", text: resp }] });
        const purposes = [];
        for (const purpose of purposesUnparsed) {
            purposes.push({
                purpose: purpose.purpose,
                alternatives: purpose.alternatives.map((x) => ({ description: x }))
            });
        }
        return {
            purposes: purposes,
            chatHistory: modelChatHistory
        };
    });
}
function FindCheaper(receipt, chatHistory) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c, _d;
        if (!receipt.purposes)
            return;
        const prefix = 'For each of the following alternatives to this purpose, give me google search queries, amazon search queries, or google maps search queries that I can use to complete the alternative.';
        const schema = '<json>{\n"alternatives": { "links": { "type": "google" | "amazon" | "maps", "query": string }[] }[] }</json>\nYou do not have to include every type of query, only the ones that make sense for the alternative given. The index of each alternative in the array must match up with the index of the given queries in your response';
        for (let i = 0; i < receipt.purposes.length; i++) {
            const purpose = receipt.purposes[i];
            const text = prefix + '\n<purpose>\n' + JSON.stringify(purpose) + '\n</purpose>\nRespond to this in JSON according to the following schema:\n' + schema;
            const resp = (_c = (_b = (_a = (yield openai.chat.completions.create({
                messages: [...chatHistory, { role: 'user', content: [{ type: 'text', text }] }],
                model,
                response_format: { type: "json_object" }
            }))) === null || _a === void 0 ? void 0 : _a.choices[0]) === null || _b === void 0 ? void 0 : _b.message) === null || _c === void 0 ? void 0 : _c.content;
            const alternatives = resp ? (_d = (0, utils_1.jsonParse)(resp)) === null || _d === void 0 ? void 0 : _d.alternatives : null;
            if (!alternatives)
                return new Error("error receiving OpenAI data");
            purpose.alternatives.forEach((alt, i) => {
                alt.links = alternatives[i].links;
            });
        }
    });
}
