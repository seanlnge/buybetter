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
            const h3Txt = item.title.length >= 40 ? item.title.slice(0, 37) + '...' : item.title;
            h3.textContent = h3Txt;

            const p = document.createElement('p');
            const pTxt = item.description.length >= 120 ? item.description.slice(0, 117) + '...' : item.description;
            p.textContent = pTxt;

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
const rs = new Renderspice('canvas');
rs.camera.x = 0;
rs.camera.y = 0;
rs.camera.w = 50;
rs.camera.h = 50 / rs.aspectRatio;

let side = 2;
for(let i=0; i<150; i++) {
    let box = rs.box(Math.random() * rs.camera.w - rs.camera.w/2, Math.random() * rs.camera.h - rs.camera.h/2-side/2, side, side);
    let rand = Math.floor(Math.random() * 16).toString(16);
    box.fill = true;
    box.fillColor = "#" + rand + rand + rand;
    box.lineColor = box.fillColor;
    box.rotate(Math.random() * 2 * Math.PI);
    box.velocity.y = Math.random() - 2;
}

let side2 = 3;
for(let i=0; i<50; i++) {
    let box = rs.box(Math.random() * rs.camera.w - rs.camera.w/2, Math.random() * rs.camera.h - rs.camera.h/2-side2/2, side2, side2);
    let rand = Math.floor(Math.random() * 2);
    box.fill = true;
    box.fillColor = "#" + rand.toString(16) + (rand*8).toString(16) + (rand*4).toString(16);
    box.lineColor = box.fillColor;
    box.rotate(Math.random() * 2 * Math.PI);
    box.velocity.y = 1.5 - Math.random();
}

rs.preRender = () => {
    rs.objects.forEach(x => {
        if(x.y < -rs.camera.h/2-side) {
            x.destroy();
            let box = rs.box(Math.random() * rs.camera.w - rs.camera.w/2, rs.camera.h/2 + side/2, side, side);
            let rand = Math.floor(Math.random() * 16).toString(16);
            box.fill = true;
            box.fillColor = "#" + rand + rand + rand;
            box.lineColor = box.fillColor;
            box.rotate(Math.random() * 2 * Math.PI);
            box.velocity.y = Math.random() - 2;
        } else if(x.y > rs.camera.h/2 + side) {
            x.destroy();
            let box = rs.box(Math.random() * rs.camera.w - rs.camera.w/2, -rs.camera.h/2, side2, side2);
            let rand = Math.floor(Math.random() * 2);
            let rand2 = rand.toString(16);
            box.fill = true;
            box.fillColor = "#" + rand.toString(16) + (rand*8).toString(16) + (rand*4).toString(16);
            box.lineColor = box.fillColor;
            box.rotate(Math.random() * 2 * Math.PI);
            box.velocity.y = 1.5 - Math.random();
        }
    });
}
rs.renderLoop();