class Elements {

    // TODO: Double click open model (print on terminal to have signal)
    // TODO: Polyline enters into graph drawing mode to draw rect lines
    // TODO: Save localStorage
    // TODO: Enable zoom
    // TODO: Operator overloading
    // TODO: Create Github

    constructor(hid, canvas) {
        this.hid = hid;
        this.canvas = canvas;

        this.elements = [];
        
        this.isHovering = false;
        this.isDragging = false;
        
        this.panOffset = new Point(0, 0);
        this.panActive = false;
        
        this.zoom = 1;
        this.elemSize = 60;
        this.initElemSize = this.elemSize;
    }

    update(ctx) {
        // Get position of mouse
        this.mouseLoc = subtract(this.panOffset, this.hid.mouseLoc);

        // Get mouse buttons
        this.mouseDownLeft = this.hid.mouseDownLeft;
        this.mouseDownCenter = this.hid.mouseDownCenter;
        this.mouseDownRight = this.hid.mouseDownRight;
        this.mouseMove = this.hid.mouseMove;

        this.#checkNewElements();
        this.#isZooming();
        this.#isHovering();
        this.#isRemoving();
        this.#isDragging();
        this.#isPanning();
        this.#draw(ctx);
    }

    #isZooming() {
        if (this.zoom != this.hid.zoom) {
            this.zoom = this.hid.zoom;
            this.elemSize = (this.initElemSize / this.zoom);
            for (let i = 0; i < this.elements.length; i++) {
                this.elements[i].loc.x = this.elements[i].loc.x / this.zoom;
                this.elements[i].loc.y = this.elements[i].loc.y / this.zoom;
            }
        }
    }

    #checkNewElements() {
        for (let i = 0; i < this.elements.length; i++) {
            if (this.elements[i].isNew) {
                this.elements[i].loc = subtract(this.panOffset, this.elements[i].loc);
                this.elements[i].isNew = false;
            }
        }
    }

    #isPanning() {
        if (this.mouseDownCenter) {
            if (!this.panActive) {
                this.panStart = this.mouseLoc;
                this.panActive = true;
            }
        }
        else {
            if (this.panActive) {
                this.panActive = false;
            }
        }

        if (this.panActive && this.mouseMove) {
            this.panOffset = add(this.panOffset, subtract(this.panStart, this.mouseLoc));
        }
    }

    #isRemoving() {
        if (this.isHovering && this.mouseDownRight) {
            this.elements.splice(this.nearestIndex, 1);
            this.isDragging = false;
        }
    }

    #isDragging() {
        if (!this.isDragging && this.isHovering && this.mouseDownLeft) {
            this.isDragging = true;
        }

        if (this.isDragging && this.elements[this.nearestIndex]) {
            this.elements[this.nearestIndex].loc = this.mouseLoc;

            if (!this.mouseDownLeft) {
                this.isDragging = false;
            }
        }
    }

    #isHovering() {
        if (this.elements.length > 1) {
            this.#getNearest();
        }
        else if (this.elements.length == 1) {
            this.nearestIndex = 0;
        }
        else {
            this.nearestIndex = null;
        }

        if (this.nearestIndex != null && getDistancePoint2Point(this.mouseLoc, this.elements[this.nearestIndex].loc) < this.elemSize) {
            this.isHovering = true;
        }
        else {
            this.isHovering = false;
        }
    }

    #getNearest() {
        const distances = [];
        for (let i = 0; i < this.elements.length; i++) {
            distances.push(getDistancePoint2Point(this.mouseLoc, this.elements[i].loc));
        }
        this.nearestIndex = distances.indexOf(Math.min(...distances));
    }

    #draw(ctx) {
        for (let i = 0; i < this.elements.length; i++) {
            const elemImg = new Image();
            let height = this.elemSize;
            switch (this.elements[i].type) {
                case 1:
                    elemImg.src = "imgs/source.png";
                    break;
                case 2:
                    elemImg.src = "imgs/vortex.png";
                    break;
                case 3:
                    elemImg.src = "imgs/dipole.png";
                    break;
                case 4:
                    elemImg.src = "imgs/corner.png";
                    break;
                case 5:
                    elemImg.src = "imgs/oval.png";
                    height = this.elemSize / 2;
                    break;
                case 6:
                    elemImg.src = "imgs/cylinder.png";
                    break;
                case 7:
                    elemImg.src = "imgs/polyline.png";
                    height = this.elemSize / 2;
                    break;
                case 8:
                    elemImg.src = "imgs/bezier.png";
                    height = this.elemSize / 2;
                    break;
            }
            if (this.isHovering && this.nearestIndex == i) {
                ctx.globalAlpha = 0.5;
            }
            else {
                ctx.globalAlpha = 1;
            }
            ctx.drawImage(
                elemImg,
                this.elements[i].loc.x - this.elemSize / 2 + this.panOffset.x,
                this.elements[i].loc.y - this.elemSize / 2 + this.panOffset.y,
                this.elemSize,
                height,
            );
        }
    }
}