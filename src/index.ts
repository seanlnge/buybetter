import express from 'express';
import multer from 'multer';
import 'dotenv/config'

import { RunReceiptChain } from './chain';
import { ReceiptCacheItem } from './utils';

const app = express();
app.use(express.static('client'));
app.set('trust proxy', true);

const storage = multer.memoryStorage();
const upload = multer({ storage });

const ReceiptCache: Map<string, ReceiptCacheItem> = new Map();

app.post('/upload-receipt', upload.single('image'), (req, res) => {
    if(!req.file) return;

    let id; do { id = Math.floor(Math.random() * 9 * 36**9 + 36**9).toString(36) } while(ReceiptCache.has(id));

    const receipt: ReceiptCacheItem = {
        birthTime: Date.now(),
        status: 'pending',
        errorMessage: null,
        chainProgress: 'reading',
        receiptText: null,
        purposes: null
    };

    ReceiptCache.set(id, receipt);
    res.send({ id });
    const ip = req.ip == "::1" ? "131.94.186.13" : req.ip ?? "127.0.0.1";
    RunReceiptChain(req.file.buffer.toString('base64'), receipt, ip);
});

app.get('/retrieve-receipt/:id', (req, res) => {
    const id = req.params.id;
    if(typeof id !== 'string') return;
    if(id.length !== 10) return;

    if(!ReceiptCache.has(id)) {
        res.send({ status: 'error', message: 'id not found in receipt cache' });
        return;
    }

    res.send(ReceiptCache.get(id));
});

app.listen(3000, () => console.log('server started'));