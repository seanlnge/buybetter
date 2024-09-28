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

    if(!response.id) window.location.reload();
    window.localStorage.setItem("id", response.id);
    window.location.href = '/loading.html';
}