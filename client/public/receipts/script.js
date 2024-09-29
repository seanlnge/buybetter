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
        document.querySelector(".upload-label").innerText = e.target.result.slice(0, 20);
        document.getElementById('receipt-preview').style.display = 'block';
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

    const reader = new FileReader();

    // Read the file as a data URL
    reader.readAsDataURL(imageFile);
    reader.onload = () => {
        window.localStorage.setItem("image", reader.result);   
    }

    window.localStorage.setItem("id", response.id);
    window.location.href = '/loading.html';
}

window.onload = () => {
    const receiptIds = JSON.parse(window.localStorage.getItem("receiptIds") ?? JSON.stringify({ ids: [] })).ids;
    const parent = document.querySelector(".prevreceipts");
    for(const id of receiptIds) {
        const receiptJSON = window.localStorage.getItem("receipt" + id);
        if(!receiptJSON) continue;

        const receipt = JSON.parse(receiptJSON);
        const elem = document.createElement("img");
        elem.src = receipt.image;
        elem.classList.add("receipt");
        elem.onclick = ((a) => () => {
            window.localStorage.setItem("id", id);
            window.location.href = "/output.html";
        })(id);
        parent.appendChild(elem);
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