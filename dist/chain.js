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
Object.defineProperty(exports, "__esModule", { value: true });
exports.RunReceiptChain = RunReceiptChain;
const vision_1 = require("./vision");
const chat_1 = require("./chat");
function RunReceiptChain(imageB64, receipt) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!receipt || !imageB64)
            return;
        const receiptData = yield (0, vision_1.ReadReceiptImage)(imageB64);
        console.log(receiptData);
        if (receiptData instanceof Error) {
            receipt.status = 'error';
            receipt.errorMessage = receiptData.message;
            return;
        }
        receipt.status = 'success';
        receipt.chainProgress = 'analyzing';
        receipt.receipt = receiptData;
        const purposes = yield (0, chat_1.ReceiptAlternatives)(receiptData.text);
        console.log(purposes);
        if (purposes instanceof Error) {
            receipt.status = 'error';
            receipt.errorMessage = purposes.message;
            return;
        }
    });
}
