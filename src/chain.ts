import { ReceiptCacheItem } from './utils';
import { ReadReceiptImage } from './vision';
import { FindCheaper, ReceiptAlternatives } from './chat';
import { GetGoogleQuery, GetAmazonQuery, GetMapsQuery } from './query';

export async function RunReceiptChain(imageB64: string, receipt: ReceiptCacheItem, ip: string) {  
    if(!receipt || !imageB64) return;

    const receiptData = await ReadReceiptImage(imageB64);
    console.log(receiptData);

    if(receiptData instanceof Error) {
        receipt.status = 'error';
        receipt.errorMessage = receiptData.message;
        return;
    }

    receipt.chainProgress = 'analyzing';
    receipt.receiptText = receiptData;

    const purposes = await ReceiptAlternatives(receiptData.text);
    console.log(purposes);

    if(purposes instanceof Error) {
        receipt.status = 'error';
        receipt.errorMessage = purposes.message;
        return;
    }

    const chatHistory = purposes.chatHistory;
    receipt.purposes = purposes.purposes;
    receipt.chainProgress = 'searching';

    await FindCheaper(receipt, chatHistory);
    console.log(receipt.purposes);

    const promiseList = [];
    for(const purpose of receipt.purposes) {
        for(const alternative of purpose.alternatives) {
            for(const link of alternative.links!) {
                if(link.type == 'google') {
                    promiseList.push((async () => link.link = await GetGoogleQuery(link.query))());
                } else if(link.type == 'amazon') {
                    promiseList.push((async () => link.link = await GetAmazonQuery(link.query))());
                } else if(link.type == 'maps') {
                    promiseList.push((async () => link.link = await GetMapsQuery(link.query, ip))());
                }
            }
        }
    }
    await Promise.all(promiseList);
    console.log(promiseList);

    receipt.chainProgress = 'complete';
    receipt.status = 'success';
}