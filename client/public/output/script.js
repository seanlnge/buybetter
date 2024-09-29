window.onload = () => {
    const id = window.localStorage.getItem("id");
    if(!id) window.location.href = "/receipts.html";
    const receiptJSON = window.localStorage.getItem("receipt" + id);
    if(!receiptJSON) window.location.href = "/loading.html";

    const receipt = JSON.parse(receiptJSON);
    console.log(receipt);
    
}