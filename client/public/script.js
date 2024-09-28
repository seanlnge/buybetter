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

// Placeholder function for analyzing the receipt
function analyzeReceipt() {
    const resultsContainer = document.getElementById('results-container');
    const resultsText = document.getElementById('results-text');

    // Simulate analyzing receipt and finding alternatives
    setTimeout(() => {
        resultsText.innerHTML = `
            <ul>
                <li><strong>Item 1:</strong> Suggested alternative: 20% cheaper</li>
                <li><strong>Item 2:</strong> Similar quality, 15% savings</li>
                <li><strong>Item 3:</strong> Recommended for better quality at the same price</li>
            </ul>
        `;
    }, 2000); // Simulate a delay for receipt analysis
}
