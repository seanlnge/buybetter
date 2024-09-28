"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
require("dotenv/config");
const chain_1 = require("./chain");
const app = (0, express_1.default)();
app.use(express_1.default.static('client'));
const ReceiptCache = new Map();
app.post('/upload-receipt', (req, res) => {
    if (!req.body.receiptImage)
        return;
    let id;
    do {
        id = Math.floor(Math.random() * Math.pow(36, 10) + Math.pow(36, 9)).toString(36);
    } while (ReceiptCache.has(id));
    const receipt = {
        birthTime: Date.now(),
        status: 'pending',
        errorMessage: null,
        chainProgress: 'reading',
        receipt: null
    };
    ReceiptCache.set(id, receipt);
    res.send({ id });
    (0, chain_1.RunReceiptChain)(req.body.receiptImage, receipt);
});
app.get('/retrieve-receipt/:id', (req, res) => {
    const id = req.query.id;
    if (typeof id !== 'string')
        return;
    if (id.length !== 9)
        return;
    if (!ReceiptCache.has(id)) {
        res.send({ status: 'error', message: 'id not found in receipt cache' });
        return;
    }
    res.send(ReceiptCache.get(id));
    ReceiptCache.delete(id);
});
app.listen(3000, () => console.log('server started'));
