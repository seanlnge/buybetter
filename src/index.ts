import * as express from 'express';
require('dotenv')();

import { RunReceiptChain } from './chain';
import { ReceiptCacheItem } from './utils';

const app = express();
app.use(express.static('client'));

const ReceiptCache: Map<string, ReceiptCacheItem> = new Map();

app.post('/upload-receipt', (req, res) => {
    if(!req.body.receiptImage) return;

    let id; do { id = Math.floor(Math.random() * 36**10 + 36**9).toString(36) } while(ReceiptCache.has(id));

    const receipt: ReceiptCacheItem = {
        birthTime: Date.now(),
        status: 'pending',
        errorMessage: null,
        chainProgress: 'reading',
        receipt: null
    };

    ReceiptCache.set(id, receipt);
    res.send({ id });
    RunReceiptChain(req.body.receiptImage, receipt);
});

app.get('/retrieve-receipt/:id', (req, res) => {
    const id = req.query.id;
    if(typeof id !== 'string') return;
    if(id.length !== 9) return;

    if(!ReceiptCache.has(id)) {
        res.send({ status: 'error', message: 'id not found in receipt cache' });
        return;
    }

    res.send(ReceiptCache.get(id));
    ReceiptCache.delete(id);
});

app.listen(3000, () => console.log('server started'));