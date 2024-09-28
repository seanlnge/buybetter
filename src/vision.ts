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
        headers: {
            'Authorization': `Bearer ${process.env.GOOGLE_ACCESS_TOKEN}`,
            'x-goog-user-project': process.env.GOOGLE_PROJECT_ID,
            'Content-Type': 'application/json; charset=utf-8'
        },
    }).catch(err => err);

    if (response.data && response.data.responses[0].textAnnotations) {
        const detectedText = response.data.responses[0].textAnnotations[0].description;
        console.log('Detected Text:\n', detectedText);
        return {
            text: detectedText
        }
    }

    console.log(response);
    return new Error("response not received");
}