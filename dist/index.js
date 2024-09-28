"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
require("dotenv/config");
const chain_1 = require("./chain");
const app = (0, express_1.default)();
app.use(express_1.default.static('client'));
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({ storage });
const ReceiptCache = new Map();
app.post('/upload-receipt', upload.single('image'), (req, res) => {
    if (!req.file)
        return;
    let id;
    do {
        id = Math.floor(Math.random() * 9 * Math.pow(36, 9) + Math.pow(36, 9)).toString(36);
    } while (ReceiptCache.has(id));
    const receipt = {
        birthTime: Date.now(),
        status: 'pending',
        errorMessage: null,
        chainProgress: 'reading',
        receiptText: null,
        purposes: null,
    };
    ReceiptCache.set(id, receipt);
    res.send({ id });
    (0, chain_1.RunReceiptChain)(req.file.buffer.toString('base64'), receipt);
});
app.get('/retrieve-receipt/:id', (req, res) => {
    const id = req.params.id;
    if (typeof id !== 'string')
        return;
    if (id.length !== 10)
        return;
    if (!ReceiptCache.has(id)) {
        res.send({ status: 'error', message: 'id not found in receipt cache' });
        return;
    }
    res.send(ReceiptCache.get(id));
});
app.listen(3000, () => console.log('server started'));
