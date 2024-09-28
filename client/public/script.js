// Function to handle file upload
function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file || !file.type.startsWith('image/')) {
        alert('Please upload a valid image file.');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const receiptPreview = document.getElementById('receipt-preview');
        receiptPreview.src = e.target.result;
        document.getElementById('preview-container').style.display = 'block';
    };
    reader.readAsDataURL(file);
}

const sleep = ms => new Promise(res => setTimeout(res, ms));

function displayErrorScreen() {
    document.body.innerHTML = `
        <div class="error-screen">
            <h2>Sorry, we can't do this right now, please try again later.</h2>
            <button onclick="window.location.href='index.html'" class="cta-button">Go Home</button>
        </div>
    `;
}

// Analyze receipt function with loading screen
async function analyzeReceipt() {
    const formData = new FormData();
    const imageFile = document.getElementById('receipt-upload').files[0];
    formData.append('image', imageFile);

    const response = await fetch('/upload-receipt', {
        method: 'POST',
        body: formData,
    }).then(res => res.json()).catch(err => {
        displayErrorScreen();
        throw new Error(err);
    });
    const id = response.id;

    // Show loading screen
    document.body.innerHTML = `
        <div class="loading-screen">
            <img src="public/loading.gif" alt="Loading" class="loading-gif">
            <p>Saving money as we speak...</p>
        </div>
    `;
    
    // Ping retrieval endpoint
    let receipt = {};
    let errCount = 0;
    while(receipt.status !== 'complete' && errCount < 3) {
        await sleep(500);
        receipt = await fetch('/retrieve-receipt/' + id).then(res => res.json()).catch(_ => {errCount++});
        if(!receipt) continue;
    }
    if(receipt.status !== 'complete') {
        displayErrorScreen();
        throw new Error(receipt.errorMessage);
    }

    // Backend is finished
    displaySuccessScreen(receipt);
}
