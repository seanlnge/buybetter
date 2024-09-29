const sleep = ms => new Promise(res => setTimeout(res, ms));

async function pingRetrievalEndpoint(id) {
    const progressText = document.querySelector('#progressText');

    let receipt = {};
    let errCount = 0;
    let startTime = Date.now();

    while(receipt.status !== 'success' && errCount < 3 && (Date.now() - startTime < 60 * 1000)) {
        await sleep(500);
        receipt = await fetch('/retrieve-receipt/' + id).then(res => res.json()).catch(_ => null);
        if(!receipt || receipt.errorMessage) {
            errCount++;
            continue;
        }

        if(receipt.chainProgress == 'reading') progressText.innerText = "Reading your receipt...";
        else if(receipt.chainProgress == 'analyzing') progressText.innerText = "Looking for better buys...";
        else if(receipt.chainProgress == 'searching') progressText.innerText = "Finding cheaper alternatives...";
        else progressText.innerText = "Complete!";
    }

    if(receipt.status !== 'success') {
        window.location.href = "/error.html";
        throw new Error(receipt.errorMessage);
    }
    
    receipt.image = window.localStorage.getItem("image") ?? "../media/buybetter.png";
    window.localStorage.setItem("receipt" + id, JSON.stringify(receipt));

    const receiptIds = JSON.parse(window.localStorage.getItem("receiptIds") ?? JSON.stringify({ ids: [] }));
    receiptIds.ids.push(id);
    window.localStorage.setItem("receiptIds", JSON.stringify(receiptIds));

    window.location.href = "/output.html";
}

window.onload = () => {
    const id = window.localStorage.getItem("id");
    if(!id) window.location.href = "/receipts.html";
    pingRetrievalEndpoint(id);
}