import axios from 'axios';
import { ReceiptText } from './utils';
import 'dotenv/config';

export async function ReadReceiptImage(imageB64: string): Promise<Error | ReceiptText> {
    const body = { "requests": [{
        "image": { "content": imageB64 },
        "features": [{ "type": "DOCUMENT_TEXT_DETECTION" }]
    }]};

    const endpoint = `https://vision.googleapis.com/v1/images:annotate`;

    const response = await axios.post(endpoint, body, { 
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        params: { 'key': process.env.GOOGLE_API_KEY }
    }).catch(err => err);

    if (response.data && response.data.responses[0].textAnnotations) {
        const detectedText = response.data.responses[0].textAnnotations[0].description;
        console.log('Detected Text:\n', detectedText);
        return {
            text: detectedText
        }
    }

    console.log(response.response.data.error);
    return new Error("response not received");
}