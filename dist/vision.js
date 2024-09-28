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
exports.ReadReceiptImage = ReadReceiptImage;
const axios_1 = __importDefault(require("axios"));
require("dotenv/config");
function ReadReceiptImage(imageB64) {
    return __awaiter(this, void 0, void 0, function* () {
        const body = { "requests": [{
                    "image": { "content": imageB64 },
                    "features": [{ "type": "DOCUMENT_TEXT_DETECTION" }]
                }] };
        const endpoint = `https://vision.googleapis.com/v1/images:annotate`;
        const response = yield axios_1.default.post(endpoint, body, {
            headers: { 'Content-Type': 'application/json; charset=utf-8' },
            params: { 'key': process.env.GOOGLE_API_KEY }
        }).catch(err => err);
        if (response.data && response.data.responses[0].textAnnotations) {
            const detectedText = response.data.responses[0].textAnnotations[0].description;
            console.log('Detected Text:\n', detectedText);
            return {
                text: detectedText
            };
        }
        console.log(response.response.data.error);
        return new Error("response not received");
    });
}
