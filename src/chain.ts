import { ReceiptCacheItem } from './utils';
import { ReadReceiptImage } from './vision';
import { ReceiptAlternatives, ReceiptPurpose } from './chat';

export async function RunReceiptChain(imageB64: string, receipt: ReceiptCacheItem) {  
    if(!receipt || !imageB64) return;

    const receiptData = await ReadReceiptImage(imageB64);

    if(receiptData instanceof Error) {
        receipt.status = 'error';
        receipt.errorMessage = receiptData.message;
        return;
    }

    receipt.status = 'success';
    receipt.chainProgress = 'analyzing';
    receipt.receipt = receiptData;

    const purposes = await ReceiptAlternatives(receiptData.text);
    if(purposes instanceof Error) {
        receipt.status = 'error';
        receipt.errorMessage = purposes.message;
        return;
    }

    console.log(purposes);
}