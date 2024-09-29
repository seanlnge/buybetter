class Renderspice {

    /**
     * @param {string} canvasId ID of canvas element
     * Renderspice - 2d Rendering Engine for HTML5 Canvas
     */
    constructor(canvasId) {

        // Setup canvas
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');

        this.aspectRatio = window.innerWidth / window.innerHeight;
        this.canvas.width = 4000;
        this.canvas.height = 4000 / this.aspectRatio;

        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.translate(this.canvas.width/2, this.canvas.height/2);
        this.ctx.scale(1, -1);
        this.ctx.clearRect(-this.canvas.width/2, -this.canvas.height/2, this.canvas.width, this.canvas.height);
        this.ctx.textAlign = 'center';
    
        // Main variables
        this.frame = 0;
        this.deltaTime = 0;
        this.totalTime = 0;
        this.lastFrame = Date.now();
        this.currentID = 1;
        this.preProcessing;
        this.preRender;

        // Camera
        this.camera = {};
        this.camera.x = this.camera.y = 0;
        this.camera.w = 50;
        this.camera.h = 50 / this.aspectRatio;
        this.camera.rotation = 0;
        this.camera.background = '#FFF';
        this.cameraCopy = JSON.parse(JSON.stringify(this.camera));

        // Objects and tags
        this.objects = [];
        this.tags = [];

        // Key Presses
        this.keys = [];
        for(let i=1; ++i<256;) {
            this.keys[i] = { down: false };
        }
        document.addEventListener('keydown', (e) => {
            this.keys[e.keyCode].down = true;
            if(this.keys[e.keyCode].onPress) this.keys[e.keyCode].onPress();
        });
        document.addEventListener('keyup', (e) => {
            this.keys[e.keyCode].down = false;
            if(this.keys[e.keyCode].onLift) this.keys[e.keyCode].onLift();
        });

        // Mouse Events
        this.mouse = {
            down: false,
            screen: {},
            movement: {},
            space: {},
        };
        document.addEventListener('mousedown', (e) => {
            this.mouse.down = true;
        });
        document.addEventListener('mousemove', (e) => {
            this.mouse.screen = { x: e.pageX, y: e.pageY }
            this.mouse.movement = { x: e.movementX, y: e.movementY }
            let spaceX = e.pageX / window.innerWidth * this.camera.w - this.camera.w/2 + this.camera.x;
            let spaceY = -e.pageY / window.innerHeight * this.camera.h + this.camera.h/2 + this.camera.y;
            this.mouse.space = { x: spaceX, y: spaceY };
        });
        document.addEventListener('mouseup', (e) => {
            this.mouse.down = false;
        });
    }

    /**
     * Get an object by a given ID
     * @param {string} id Identifier for object
     */
    getObject(id) {
        return this.objects.find(o => o.id === id);
    }



    /****** Objects ******/

    /**
     * @param {number} x X position of box
     * @param {number} y Y position of box
     * @param {number} w Width of box
     * @param {number} h Height of box
     * Create a Renderspice box object
     */
    box(x=0, y=0, w=1, h=1) {

        // Create points
        let p1 = { x: -w/2, y: -h/2 };
        let p2 = { x: -w/2, y: h/2 };
        let p3 = { x: w/2, y: h/2 };
        let p4 = { x: w/2, y: -h/2 };
        let points = [p1, p2, p3, p4];

        // Object values
        let object = new Renderspice.prototype.object(x, y, points);
        object.w = w;
        object.h = h;
        object.shape = 'box';

        // Collisions
        object.collisionBody = new Renderspice.prototype.collisionBody(x, y, points);
        object.collisionBody.method = 'box';

        // Apply
        object.id = this.currentID;
        this.currentID++;
        this.objects.push(object);
        return object;
    }

    /**
     * @param {number} x X position of triangle
     * @param {number} y Y position of triangle
     * @param {number} w Base width of triangle
     * @param {number} h Height of triangle
     * Create a Renderspice triangle object
     */
    triangle(x=0, y=0, w=1, h=1) {

        // Create points
        let p1 = { x: 0, y: h/2 };
        let p2 = { x: w/2, y: -h/2 };
        let p3 = { x: -w/2, y: -h/2 };
        let points = [p1, p2, p3];

        // Object values
        let object = new Renderspice.prototype.object(x, y, points);
        object.w = w;
        object.h = h;
        object.shape = 'triangle';

        // Collisions
        object.collisionBody = new Renderspice.prototype.collisionBody(x, y, points);

        // Apply
        object.id = this.currentID;
        this.currentID++;
        this.objects.push(object);
        return object;
    }

    /**
     * @param {number} x X position of circle
     * @param {number} y Y position of circle
     * @param {number} r Radius of circle
     * @param {number} tesselation Number of tesselations
     * Create a Renderspice circle object
     */
    circle(x=0, y=0, r=0.5, tesselation=20) {

        // Create points
        let points = [];
        for(let i=0; i<tesselation; i++) {
            let it = i / tesselation;
            let x = Math.cos(it * Math.PI*2) * r;
            let y = Math.sin(it * Math.PI*2) * r;
            points.push({ x, y });
        }

        // Object values
        let object = new Renderspice.prototype.object(x, y, points);
        object.radius = r;
        object.tesselations = tesselation;
        object.shape = 'circle';

        // Collisions
        object.collisionBody = new Renderspice.prototype.collisionBody(x, y, points);
        object.collisionBody.method = 'circle';

        // Apply
        object.id = this.currentID;
        this.currentID++;
        this.objects.push(object);
        return object;
    }

    /**
     * @param {number} x X position of polygon
     * @param {number} y Y position of polygon
     * @param {array} points All points on the polygon
     * Create polygon out of list of points
     */
    polygon(x=0, y=0, points=[]) {
        
        // Object values
        let object = new Renderspice.prototype.object(x, y, points);
        object.shape = 'polygon';

        // Collisions
        object.collisionBody = new Renderspice.prototype.collisionBody(x, y, points);

        // Apply
        object.id = this.currentID;
        this.currentID++;
        this.objects.push(object);
        return object;
    }

    /**
     * @param {string} string Text to display
     * @param {number} x X position of text
     * @param {number} y Y position of text
     * @param {string} font Font-family of text
     * @param {number} size Pixel size of text
     * Create a Renderspice text object
     */
    text(string='Lorem ipsum', x=0, y=0, font='Segoe UI', size=16) {
        let object = new Renderspice.prototype.uiObject(x, y);

        // Edit values of UI object
        object.uiType = 'text';
        object.text = string;
        object.font = font;
        object.size = size;

        object.id = this.currentID;
        this.currentID++;
        this.objects.push(object);
        return object;
    }

    /**
     * @param {string} url Image URL
     * @param {number} x X position of image
     * @param {number} y Y position of image
     * @param {number} w Width of image
     * @param {number} h Height of image
     */
    image(url, x, y, w, h) {
        let object = new Renderspice.prototype.uiObject(x, y);
        object.uiType = 'image';
        object.url = url;
        object.w = w;
        object.h = h

        object.id = this.currentID;
        this.currentID++;
        this.objects.push(object);
        return object;
    }

    /****** Tags ******/
    tag(name) {
        let object = new Renderspice.prototype.tagObject(name);
        object.id = this.currentID;
        this.currentID++;
        this.tags[name] = object;
        return object;
    }

    /****** Collisions ******/
    runCollisions(objects) {

        // Set collision boolean to false
        for(let object of objects) {
            if(object.objectType == 'ui') continue;
            object.collisionBody.colliding = false;
            object.collisionBody.colliders = [];
        }

        // Runs max O((n^2-n)/2) time complexity
        for(let i=0; i<objects.length; i++) {
            if(objects[i].objectType == 'ui') continue;
            if(!objects[i].collisionBody.detect) continue;

            if(objects[i].collisionBody.include.length > 0) {
                for(let id of objects[i].collisionBody.include) {
                    let object1 = objects[i];
                    let object2 = this.getObject(id);

                    if(!object2.collisionBody.detect || object2.objectType == 'ui') continue;

                    // Check if in collision range
                    let dist = Math.sqrt((object1.x - object2.x) ** 2 + (object1.y - object2.y) ** 2);
                    if(dist >= object1.collisionBody.range + object2.collisionBody.range) continue;

                    if(object2.collisionBody.exclude.find(a => a === object1.id)) continue;
                    if(object1.collisionBody.include.length
                    && !object2.collisionBody.include.find(a => a === object1.id)) {
                        continue;
                    }
                    
                    // Determine which collision method to use
                    switch([object1.collisionBody.method, object2.collisionBody.method]) {
                        /*case ['box', 'box']:
                            break;*/
                        case ['circle', 'circle']:
                            this.resolveCollision(object1, object2);
                            break;
                        default:
                            this.polygonalCollision(object1, object2);
                    }
                }
                continue;
            }

            for(let j=i+1; j<objects.length; j++) {

                // Make sure object has collision body
                if(objects[j].objectType == 'ui') continue;
                if(!objects[j].collisionBody.detect) continue;

                // Check if in collision range
                let dist = Math.sqrt((objects[i].x - objects[j].x) ** 2 + (objects[i].y - objects[j].y) ** 2);
                if(dist >= objects[i].collisionBody.range + objects[j].collisionBody.range) continue;
                
                // Make sure objects are allowed to collide
                let include2 = objects[j].collisionBody.include.find(a => a === objects[i].id);
                let exclude1 = objects[i].collisionBody.exclude.find(a => a === objects[j].id);
                let exclude2 = objects[j].collisionBody.exclude.find(a => a === objects[i].id);
                include2 |= objects[j].collisionBody.include.length == 0;
                if(!include2 || exclude1 || exclude2) continue;

                // Setup objects
                let object1 = objects[i];
                let object2 = objects[j];
                
                // Determine which collision method to use
                switch([object1.collisionBody.method, object2.collisionBody.method]) {
                    /*case ['box', 'box']:
                        break;*/
                    case ['circle', 'circle']:
                        this.resolveCollision(object1, object2);
                        break;
                    default:
                        this.polygonalCollision(object1, object2);
                }
            }
        }
    }

    resolveCollision(object1, object2, axis) {
        
        // All are false
        if(!axis) axis = { o1: {}, o2: {} };

        // Call functions for collisions
        object1.collisionBody.onCollide(object2);
        object2.collisionBody.onCollide(object1);

        object1.collisionBody.colliding = true;
        object2.collisionBody.colliding = true;
        object1.collisionBody.colliders.push(object2.id);
        object2.collisionBody.colliders.push(object1.id);

        // Edit velocities and positions
        if(!axis.o1.x && object1.collisionBody.resolve) object1.x -= object1.velocity.x * rs.deltaTime;
        if(!axis.o1.y && object1.collisionBody.resolve) object1.y -= object1.velocity.y * rs.deltaTime;
        if(!axis.o2.x && object2.collisionBody.resolve) object2.x -= object2.velocity.x * rs.deltaTime;
        if(!axis.o2.y && object2.collisionBody.resolve) object2.y -= object2.velocity.y * rs.deltaTime;

        if(!axis.o1.x && object1.collisionBody.resolve) object1.velocity.x = 0;
        if(!axis.o1.y && object1.collisionBody.resolve) object1.velocity.y = 0;
        if(!axis.o2.x && object2.collisionBody.resolve) object2.velocity.x = 0;
        if(!axis.o2.y && object2.collisionBody.resolve) object2.velocity.y = 0;
    }

    // Collisions between polygons
    polygonalCollision(object1, object2) { // pls minimize this function it is too long
        
        // Main variables
        let colliding = false;
        let axis = {
            o1: { x: 1, y: 1, useX: false, useY: false },
            o2: { x: 1, y: 1, useX: false, useY: false }
        }

        // Check if point is touching line
        let pointOnLine = (a, b, p) => {
            if(p.x < Math.max(a.x, b.x) && p.x > Math.min(a.x, b.x)
            && p.y < Math.max(a.y, b.y) && p.y > Math.min(a.y, b.y)) return true;
            return false;
        }

        // Check if line is colliding with other line
        let pointOrientation = (a, b, p) => {
            let val = (b.y - a.y) * (p.x - b.x) - (b.x - a.x) * (p.y - b.y);
            return (val > 0) ? 1 : (val < 0) ? 2 : 0;
        }

        // Check for collisions between lines
        let check = (line1, line2) => {
            let o1 = pointOrientation(line1[0], line1[1], line2[0]);
            let o2 = pointOrientation(line1[0], line1[1], line2[1]);
            let o3 = pointOrientation(line2[0], line2[1], line1[0]);
            let o4 = pointOrientation(line2[0], line2[1], line1[1]);

            if(o1 != o2 && o3 != o4) return true;

            if(!o1 && pointOnLine(line1[0], line1[1], line2[0])) return 2;
            if(!o2 && pointOnLine(line1[0], line1[1], line2[1])) return 3;
            if(!o3 && pointOnLine(line2[0], line2[1], line1[0])) return 4;
            if(!o4 && pointOnLine(line2[0], line2[1], line1[1])) return 5;

            return false;
        }

        // Preresolve  (sorry about the 9 params lmao)
        let preResolve = (object1, object2, line1, line2, combinedX, combinedY, k, l, axis) => {

            // Slide across y-axis
            if(line2.slope == Infinity) {
                axis.y &= 1;
                axis.useY = true;

                // Allow object sliding
                if(line1.slope == 0) {
                    let xDif = Math.min(line2.points[0].x - line1.left, line1.right - line2.points[0].x);
                    let yDif = Math.min(line2.top - line1.points[0].y, line1.points[0].y - line2.bottom);
                    let prevY = Math.round((line1.points[0].y - combinedY) * 10000) / 10000;
                    
                    // Check if following point forms colliding line
                    let np1 = object1.points[(k-1+object1.points.length)%object1.points.length];
                    np1 = { x: np1.x + object1.x, y: np1.y + object1.y };
                    let np2 = object1.points[(k+2)%object1.points.length];
                    np2 = { x: np2.x + object1.x, y: np2.y + object1.y };
                    let nl = {};
                    if(combinedX > 0) nl = Math.max(np1.x, np2.x) === np1.x ? np1 : np2;
                    if(combinedX < 0) nl = Math.min(np1.x, np2.x) === np1.x ? np1 : np2;

                    // Determine whether velocities form to collide objects
                    if((prevY <= line2.top || (nl && nl.y <= prevY))
                    && (line2.bottom <= prevY || (nl && prevY <= nl.y))) axis.x = 0;
                } else {
                    axis.x = 0;
                }
            } else if(line2.slope == 0) {
                axis.x &= 1;
                axis.useX = true;

                // Allow object sliding
                if(line1.slope == Infinity) {
                    let xDif = Math.min(line1.points[0].x - line2.left, line2.right - line1.points[0].x);
                    let yDif = Math.min(line1.top - line2.points[0].y, line2.points[0].y - line1.bottom);
                    let prevX = Math.round((line1.points[0].x - combinedX) * 10000) / 10000;

                    // Check if following point forms colliding line
                    let np1 = object1.points[(k-1+object1.points.length)%object1.points.length];
                    np1 = { x: np1.x + object1.x, y: np1.y + object1.y };
                    let np2 = object1.points[(k+2)%object1.points.length];
                    np2 = { x: np2.x + object1.x, y: np2.y + object1.y };
                    let nl = {};
                    if(combinedY > 0) nl = Math.max(np1.y, np2.y) === np1.y ? np1 : np2;
                    if(combinedY < 0) nl = Math.min(np1.y, np2.y) === np1.y ? np1 : np2;

                    // Determine whether velocities form to collide objects
                    if((prevX <= line2.right || (nl && nl.x <= prevX))
                    && (line2.left <= prevX || (nl && prevX <= nl.x))) axis.y = 0;
                } else {
                    axis.y = 0;
                }
            }
        }

        // Loop each line over each line
        for(let k=0; k<object1.points.length; k++) {
            for(let l=0; l<object2.points.length; l++) {

                // Setup lines
                let p1 = object1.points[k];
                let p2 = object1.points[(k+1)%object1.points.length];
                let p3 = object2.points[l];
                let p4 = object2.points[(l+1)%object2.points.length];

                let line1 = [
                    { x: p1.x + object1.x, y: p1.y + object1.y },
                    { x: p2.x + object1.x, y: p2.y + object1.y },
                ];
                let line2 = [
                    { x: p3.x + object2.x, y: p3.y + object2.y },
                    { x: p4.x + object2.x, y: p4.y + object2.y },
                ];

                let thisCollide = check(line1, line2);
                colliding = colliding || thisCollide;

                // Change velocities based on collision direction
                if(thisCollide) {

                    // Get combined velocities
                    let combinedX = (object1.velocity.x + object2.velocity.x) * this.deltaTime;
                    let combinedY = (object1.velocity.y + object2.velocity.y) * this.deltaTime;

                    // Get maxes and mins to determine which line creates collision
                    let l1 = {
                        points: line1,
                        top: Math.max(line1[0].y, line1[1].y),
                        bottom: Math.min(line1[0].y, line1[1].y),
                        left: Math.min(line1[0].x, line1[1].x),
                        right: Math.max(line1[0].x, line1[1].x),
                        slope: Math.abs((line1[0].y - line1[1].y) / (line1[0].x - line1[1].x))
                    }
                    let l2 = {
                        points: line2,
                        top: Math.max(line2[0].y, line2[1].y),
                        bottom: Math.min(line2[0].y, line2[1].y),
                        left: Math.min(line2[0].x, line2[1].x),
                        right: Math.max(line2[0].x, line2[1].x),
                        slope: Math.abs((line2[0].y - line2[1].y) / (line2[0].x - line2[1].x))
                    }

                    preResolve(object1, object2, l1, l2, combinedX, combinedY, k, l, axis.o1);
                    preResolve(object2, object1, l2, l1, combinedX, combinedY, k, l, axis.o2);
                }
            }
        }

        // Set values to specific objects
        if(!axis.o1.useX) axis.o1.x = 0;
        if(!axis.o1.useY) axis.o1.y = 0;
        if(!axis.o2.useX) axis.o2.x = 0;
        if(!axis.o2.useY) axis.o2.y = 0;

        if(colliding) this.resolveCollision(object1, object2, axis);
    } // thank you


    /****** Rendering ******/

    /**
     * Render screen on a loop every animation frame
     */
    renderLoop() {
        let scope = this;
        function loop() {
            if(scope.preProcessing) scope.preProcessing();
            scope.render();
            requestAnimationFrame(loop);
        }
        requestAnimationFrame(loop);
    }

    /**
     * Render the current screen
     */
    render() {

        // Change main variables
        this.deltaTime = (Date.now() - this.lastFrame) / 1000;
        this.lastFrame = Date.now();
        this.totalTime += this.deltaTime * 1000;

        // Make sure frame on time
        if(this.deltaTime > 0.200) return;
        this.frame++;

        // Before processing
        this.mouse.space.x += this.camera.x - this.cameraCopy.x;
        this.mouse.space.y += this.camera.y - this.cameraCopy.y;

        // Reset canvas
        this.ctx.fillStyle = this.camera.background;
        this.ctx.fillRect(-this.canvas.width/2, -this.canvas.height/2, this.canvas.width, this.canvas.height);

        // Check over tags
        for(let tagName in this.tags) {
            let tag = this.tags[tagName];

            // Destroy tag
            tag.timeAlive += this.deltaTime;
            if(tag.lifespan && tag.lifespan < tag.timeAlive) {
                tag.destroy();
            }
            if(tag.toDestroy) {
                delete this.tags[tagName];
                continue;
            }

            // Duplicate tag
            if(tag.toDuplicate) {

                // Find unique name and id
                let ntag = tag.toDuplicate;
                let createName = name => {
                    if(!this.tags[name]) return name;
                    return createName(name + 'Copy');
                }
                ntag.id = this.currentID;
                this.currentID++;
                ntag.name = createName(ntag.name);

                // Change objects' tag name
                for(let object of ntag.objects) {
                    object.tag = ntag.name;
                }

                // Conclusion
                this.tags[ntag.name] = ntag;
                delete tag.toDuplicate;
            }
        }

        // Check over objects
        for(let i=0; i<this.objects.length; i++) {
            let object = this.objects[i];

            if(object.tag) {
                object.x += this.tags[object.tag].x;
                object.y += this.tags[object.tag].y;
            }

            // Destroy object
            object.timeAlive += this.deltaTime;
            if(object.lifespan && object.lifespan < object.timeAlive) {
                object.destroy();
            }
            if(object.toDestroy) {
                this.objects.splice(i, 1);
                i--;
                continue;
            }

            // Duplicate object
            if(object.toDuplicate) {
                object.toDuplicate.id = this.currentID;
                this.currentID++;
                this.objects.push(object.toDuplicate);
                delete object.toDuplicate;
            }

            // Velocities
            object.velocity.y -= object.gravity * this.deltaTime;
            object.x += object.velocity.x * this.deltaTime;
            object.y += object.velocity.y * this.deltaTime;
        }

        // Collisions
        this.runCollisions(this.objects);

        // After processing
        this.cameraCopy = JSON.parse(JSON.stringify(this.camera));
        if(this.preRender) this.preRender();

        // Draw objects
        for(let object of this.objects) {
            this.drawObject(object);
            if(object.tag) {
                object.x -= this.tags[object.tag].x;
                object.y -= this.tags[object.tag].y;
            }
        }        
    }

    // Turn a point in space into a point on the screen
    spaceToScreen(x, y) {
        let nx = x / this.camera.w * this.canvas.width;
        let ny = y / this.camera.h * this.canvas.height;
        return { x: nx, y: ny };
    }

    /**
     * @param {object} object Renderspice object to render
     * Render single object
     */
    drawObject(object) {
        
        // Specific function for UI objects
        let drawUI = () => {
            switch(object.uiType) {
                case 'text':

                    // Edit transformation of canvas
                    this.ctx.scale(1, -1);
                    let screen = this.spaceToScreen(object.x - this.camera.x, object.y - this.camera.y);
                    this.ctx.translate(screen.x, -screen.y);
                    //if(object.rotation) this.ctx.rotate(-object.rotation);

                    let nsize = this.canvas.width / window.innerWidth * object.size; 
                    this.ctx.font = `${nsize}px ${object.font}`;
                    if(object.line) this.ctx.strokeText(object.text, 0, 0);
                    if(object.fill) this.ctx.fillText(object.text, 0, 0);
                    
                    // Reset transformation of canvas
                    //if(object.rotation) this.ctx.rotate(object.rotation);
                    this.ctx.translate(-screen.x, screen.y);
                    this.ctx.scale(1, -1);
                    break;

                case 'image':
                    break;
            }
        }

        // Specific function for polygonal function
        let drawPolygon = () => {
            // Get tag and camera data
            let addX = object.x - this.camera.x;
            let addY = object.y - this.camera.y;

            // Move pointer to first point
            let p1 = object.points[0];
            let s1 = this.spaceToScreen(p1.x + addX, p1.y + addY);
            this.ctx.beginPath();
            this.ctx.moveTo(s1.x, s1.y);
            

            // Iterate over later points
            for(let i=1; i<object.points.length; i++) {
                let point = object.points[i];
                let space = this.spaceToScreen(point.x + addX, point.y + addY);
                this.ctx.lineTo(space.x, space.y);
            }


            // Fill and stroke lines
            this.ctx.closePath();
            if(object.line) this.ctx.stroke();
            if(object.fill) this.ctx.fill();
        }

        this.ctx.lineWidth = object.lineWidth;
        this.ctx.fillStyle = object.fillColor;
        this.ctx.strokeStyle = object.lineColor;

        switch(object.objectType) {
            case 'polygon':
                drawPolygon();
                break;
            case 'ui':
                drawUI();
                break;
        }
    }
}



// Object for creating polygons
Renderspice.prototype.object = class {
    constructor(x, y, points, settings = {}) {

        // Basic values
        this.x = x;
        this.y = y;
        this.points = points;
        this.velocity = { x: 0, y: 0 };
        this.gravity = 0;
        this.rotation = 0;
        this.scaleValue = { x: 1, y: 1 };
        this.objectType = 'polygon';

        // Complex values
        this.timeAlive = 0;
        this.lifespan = 0;

        // Colors
        this.fill = settings.fill || true;
        this.fillColor = settings.fillColor || '#000';
        this.line = settings.line || true;
        this.lineColor = settings.lineColor || '#000';
        this.lineWidth = settings.lineWidth || 10;
    }

    /**
     * Scale object
     * @param {number} x
     * @param {number} y
     */
    scale(x, y) {
        if(!y) y = x;
        this.scaleValue.x *= x;
        this.scaleValue.y *= y;
        for(let point of this.points) {
            point.x *= x;
            point.y *= y;
        }
        return this;
    }
    
    /**
     * Set scale of object
     * @param {number} x X value to set scale to
     * @param {number} y Y value to set scale to
     */
    setScale(x, y) {
        this.scale(x/this.scaleValue.x, y/this.scaleValue.y);
        return this;
    }

    /**
     * Rotate object counter-clockwise
     * @param {number} theta Radians to rotate by
     */
    rotate(theta) {
        this.rotation += theta;

        for(let point of this.points) {
            let px = point.x;
            let py = point.y;
            let bx = px * Math.cos(theta) - py * Math.sin(theta);
            let by = px * Math.sin(theta) + py * Math.cos(theta);
            
            point.x = bx;
            point.y = by;
        }

        return this;
    }
    
    /**
     * Set rotation of object
     * @param {number} theta Radians to rotate to
     */
    setRotation(theta) {
        this.rotate(theta - this.rotation);
    }

    /**
     * Destroy object
     */
    destroy() {
        this.toDestroy = true;
    }

    /**
     * Duplicate object
     */
    duplicate() {
        let deepCopy = (obj) => {
            if (typeof obj !== 'object' || 'isActiveClone' in obj) return obj;

            let temp = new obj.constructor();

            for (var key in obj) {
                if (Object.prototype.hasOwnProperty.call(obj, key)) {
                    obj['isActiveClone'] = null;
                    temp[key] = deepCopy(obj[key]);
                    delete obj['isActiveClone'];
                }
            }
            return temp;
        }

        let copy = deepCopy(this);

        this.toDuplicate = copy;
        return copy;
    }
}


// Collision object for creating collisions
Renderspice.prototype.collisionBody = class {
    constructor(x=0, y=0, points=[]) {
        this.x = x;
        this.y = y;
        this.points = points;
        this.method = "polygon";

        // Farthest value where collision is possible
        this.range = Math.sqrt(
            points.reduce((a, c) => Math.max(Math.abs(c.x), a), 0) ** 2 +
            points.reduce((a, c) => Math.max(Math.abs(c.y), a), 0) ** 2
        );

        // Collision settings
        this.detect = true;
        this.resolve = false;
        this.onCollide = () => {};
        this.include = [];
        this.exclude = [];

        // Collision returns
        this.colliding = false;
        this.colliders = [];
    }
}

// Tag object for creating tags
Renderspice.prototype.tagObject = class {
    constructor(name) {
        // Basic values
        this.name = name;
        this.objects = [];
        this.x = 0;
        this.y = 0;
        this.velocity = { x: 0, y: 0 };

        // Complex values
        this.lifespan = 0;
        this.timeAlive = 0;
    }

    /**
     * Add an object to tag
     * @param {Renderspice} objects Objects to add
     */
    add(...objects) {
        for(let object of objects) {
            this.objects.push(object);
            if(object.tag) {
                console.error('Renderspice Error: An object cannot have more than 1 tag');
                return; 
            }
            object.tag = this.name;
        }
        return this;
    }

    /**
     * Remove an object from tag
     * @param {Renderspice} objects Objects to remove
     */
    remove(...objects) {
        for(let i=0; i<objects.length; i++) {
            let object = objects[i];
            let index = this.objects.findIndex(a => a === object);
            if(index === -1) {
                console.error('Renderspice Error: Object not found in tag');
                return;
            }
            this.objects.splice(index, 1);
            i--;
            object.tag = undefined;
        }
        return this;
    }

    /**
     * Merge tag with this tag, keeping this name
     * @param {tags} Any tags to merge into current
     */
    merge(...tags) {
        for(let tag of tags) {
            if(!tag.objects) continue;
            this.add(...tag.objects);
        }
        return this;
    }

    /**
     * Duplicate tag and all of its objects
     */
    duplicate() {
        let deepCopy = (obj) => {
            if (typeof obj !== 'object' || 'isActiveClone' in obj) return obj;

            let temp = new obj.constructor();

            for (var key in obj) {
                if (Object.prototype.hasOwnProperty.call(obj, key)) {
                    obj['isActiveClone'] = null;
                    temp[key] = deepCopy(obj[key]);
                    delete obj['isActiveClone'];
                }
            }
            return temp;
        }

        let copy = deepCopy(this);
        copy.objects = [];

        // Duplicate objects in tag
        for(let object of this.objects) {
            let a = object.duplicate();
            a.tag = '';
            copy.add(a);
        }

        this.toDuplicate = copy;
        return copy;
    }

    /**
     * Destroy tag, but keep objects
     */
    destroy() {
        for(let object of this.objects) {
            object.tag = undefined;
        }
        this.toDestroy = true;
    }
}



// Object for creating UI
Renderspice.prototype.uiObject = class {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.velocity = { x: 0, y: 0 };
        this.gravity = 0;
        this.scaleValue = { x: 1, y: 1 };
        this.rotation = 0;
        this.objectType = 'ui';
        this.fillColor = '#000';
        this.lineColor = '#000';
        this.lineWidth = 15;
        this.line = true;
        this.fill = true;
    }

    /**
     * Scale object
     * @param {number} x X value to scale by
     * @param {number} y Y value to scale by
     */
    scale(x, y) {
        if(!y) y = x;
        this.scaleValue.x *= x;
        this.scaleValue.y *= y;
        return this;
    }

    /**
     * Set scale of object
     * @param {number} x X value to set scale to
     * @param {number} y Y value to set scale to
     */
    setScale(x, y) {
        this.scale(x/this.scaleValue.x, y/this.scaleValue.y);
        return this;
    }
    
    /**
     * Rotate object counter-clockwise
     * @param {number} theta Radians to rotate by
     */
    rotate(theta) {
        this.rotation += theta;
        return this;
    }

    /**
     * Set rotation of object
     * @param {number} theta Radians to rotate to
     */
    setRotation(theta) {
        this.rotate(theta - this.rotation);
        return this;
    }
}