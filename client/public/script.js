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


fetch('/word').then(res => res.json()).then(data => alert(data.value));