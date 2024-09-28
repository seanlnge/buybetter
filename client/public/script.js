// Function to handle file upload
function handleFileUpload(event) {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const receiptPreview = document.getElementById('receipt-preview');
            receiptPreview.src = e.target.result;
            document.getElementById('preview-container').style.display = 'block';
        };
        reader.readAsDataURL(file);
    } else {
        alert('Please upload a valid image file.');
    }
}

// Analyze receipt function with loading screen
function analyzeReceipt() {
    // Show loading screen
    document.body.innerHTML = `
        <div class="loading-screen">
            <img src="public/loading.gif" alt="Loading" class="loading-gif">
            <p>Saving money as we speak...</p>
        </div>
    `;

    // Simulate AI processing time
    setTimeout(() => {
        // After 5 seconds, show error message
        document.body.innerHTML = `
            <div class="error-screen">
                <h2>Sorry, we can't do this right now, please try again later.</h2>
                <button onclick="window.location.href='index.html'" class="cta-button">Go Home</button>
            </div>
        `;
    }, 5000);
}
