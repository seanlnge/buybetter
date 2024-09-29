let receipt;
window.onload = () => {
    const id = window.localStorage.getItem("id");
    if(!id) window.location.href = "/receipts.html";
    const receiptJSON = window.localStorage.getItem("receipt" + id);
    if(!receiptJSON) window.location.href = "/loading.html";

    const r = JSON.parse(receiptJSON);
    console.log(r);
    receipt = r;
    loadData();
}

let purposeIndex = 0;
let alternativeIndex = 0;

const purIndex = amt => {
    let len = receipt.purposes.length;
    purposeIndex += amt == 1 ? 1 : len - 1;
    purposeIndex %= len;
    loadData();
}
const altIndex = amt => {
    let len = receipt.purposes[purposeIndex].alternatives.length;
    alternativeIndex += amt == 1 ? 1 : len - 1;
    alternativeIndex %= len;
    loadData();
}

const API_KEY = "AIzaSyAe6OhCyPbv7ofd8XN1qrFgS3q0P539HM8";

function loadData() {
    const purp = receipt.purposes[purposeIndex];
    document.querySelector(".purpose > p").innerText = purp.purpose;
    document.querySelector(".altdesc").innerText = purp.alternatives[alternativeIndex].description;

    const alt = purp.alternatives[alternativeIndex];
    const altitems = document.querySelector(".alternatives > .items");
    altitems.innerHTML = "";
    for(const item of alt.links) {
        const elem = document.createElement('div');
        elem.classList.add("altelem");
        if(item.type == 'maps') {
            const uri = encodeURIComponent(item.link);
            const iframeSrc = `https://www.google.com/maps/embed/v1/place?key=${API_KEY}&q=${uri}`;
            const iframe = document.createElement('iframe');
            iframe.classList.add("map")
            iframe.loading = "lazy";
            iframe.allowFullscreen = true;
            iframe.referrerPolicy = "no-referrer-when-downgrade";
            iframe.src = iframeSrc;
            elem.appendChild(iframe);
        } else {
            const div2 = document.createElement('div');
            div2.classList.add('alteleminner');
            const h3 = document.createElement('h3');
            h3.textContent = item.title.slice(0, 40);

            const p = document.createElement('p');
            p.textContent = item.description.slice(0, 120);

            const button = document.createElement('button');
            // button.textContent = 'Check it out >';
            // button.onclick = () => window.open(item.link, '_blank').focus();
            // const button = document.createElement('button');
button.textContent = 'Check it out >';
button.classList.add('check-out-button'); // Add the class here
button.onclick = () => window.open(item.link, '_blank').focus();


            div2.appendChild(h3);
            div2.appendChild(p);
            div2.appendChild(button);
            elem.appendChild(div2);
        }
        altitems.appendChild(elem);
    }
}