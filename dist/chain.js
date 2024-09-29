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
const query_1 = require("./query");
function RunReceiptChain(imageB64, receipt, ip) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!receipt || !imageB64)
            return;
        const receiptData = yield (0, vision_1.ReadReceiptImage)(imageB64);
        if (receiptData instanceof Error) {
            receipt.status = 'error';
            receipt.errorMessage = receiptData.message;
            return;
        }
        receipt.chainProgress = 'analyzing';
        receipt.receiptText = receiptData;
        const purposes = yield (0, chat_1.ReceiptAlternatives)(receiptData.text);
        if (purposes instanceof Error) {
            receipt.status = 'error';
            receipt.errorMessage = purposes.message;
            return;
        }
        const chatHistory = purposes.chatHistory;
        receipt.purposes = purposes.purposes;
        receipt.chainProgress = 'searching';
        yield (0, chat_1.FindCheaper)(receipt, chatHistory);
        const promiseList = [];
        for (const purpose of receipt.purposes) {
            for (const alternative of purpose.alternatives) {
                for (const link of alternative.links) {
                    if (link.type == 'google') {
                        promiseList.push((() => __awaiter(this, void 0, void 0, function* () {
                            const data = yield (0, query_1.GetGoogleQuery)(link.query);
                            link.link = data.link;
                            link.title = data.title;
                            link.description = data.description;
                        }))());
                    }
                    else if (link.type == 'amazon') {
                        promiseList.push((() => __awaiter(this, void 0, void 0, function* () {
                            const data = yield (0, query_1.GetAmazonQuery)(link.query);
                            link.link = data.link;
                            link.title = data.title;
                            link.description = data.description;
                        }))());
                    }
                    else if (link.type == 'maps') {
                        promiseList.push((() => __awaiter(this, void 0, void 0, function* () { return link.link = yield (0, query_1.GetMapsQuery)(link.query, ip); }))());
                    }
                }
            }
        }
        yield Promise.all(promiseList);
        receipt.chainProgress = 'complete';
        receipt.status = 'success';
    });
}
