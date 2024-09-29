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