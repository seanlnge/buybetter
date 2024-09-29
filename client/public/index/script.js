const rs = new Renderspice('canvas');
rs.camera.x = 0;
rs.camera.y = 0;
rs.camera.w = 50;
rs.camera.h = 50 / rs.aspectRatio;


let side = 4;
function makeBox() {
    let box = rs.box(Math.random() * rs.camera.w - rs.camera.w/2, Math.random() * rs.camera.h - rs.camera.h/2-side/2, side, side);
    let rand = Math.floor(Math.random() * 16).toString(16);
    box.fill = true;
    box.fillColor = "#" + rand + rand + rand;
    box.lineColor = box.fillColor;
    box.rotate(Math.random() * 2 * Math.PI);
    box.velocity.y = Math.random() - 2;
    return box;
}
const a = [];
for(let i=0; i<150; i++) a.push(makeBox());

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
        }
    });
}
rs.renderLoop();