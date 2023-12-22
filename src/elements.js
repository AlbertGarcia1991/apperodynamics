class Elements {

    constructor(hid, canvas) {
        this.hid = hid;
        this.canvas = canvas;

        this.elements = [];
        
        this.isHovering = false;
        this.isDragging = false;
        
        this.panOffset = new Point(0, 0);
        this.panActive = false;
        
        this.zoom = 1;
        this.elemSize = 40;
        this.initElemSize = this.elemSize;

        this.gridMainWidth = 1;
        this.gridSecondaryWidth = 0.2;
        this.gridSecondaryVerticalSpacingInit = 20;
        this.gridSecondaryHorizontalSpacingInit = 20 ;
    }

    loadJSON(elementsSerialized) {
        
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
            this.elemSize = (this.initElemSize * this.zoom);
            // for (let i = 0; i < this.elements.length; i++) {
            //     this.elements[i].loc.x = this.elements[i].loc.x * this.zoom;
            //     this.elements[i].loc.y = this.elements[i].loc.y / this.zoom;
            // }
        }
        this.gridSecondaryVerticalSpacing = this.gridSecondaryVerticalSpacingInit * this.zoom;
        this.gridSecondaryHorizontalSpacing = this.gridSecondaryHorizontalSpacingInit * this.zoom;
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
        if (!this.isDragging && this.isHovering && this.mouseDownLeft && !this.mouseDownRight) {
            this.isDragging = true;
            this.draggingOffset = new Point(
                this.elements[this.nearestIndex].loc.x - this.mouseLoc.x,
                this.elements[this.nearestIndex].loc.y - this.mouseLoc.y
            );
        }

        if (this.isDragging && this.elements[this.nearestIndex]) {
            this.elements[this.nearestIndex].loc = add(this.mouseLoc, this.draggingOffset);
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

    #drawGrid(ctx) {
        const centerViewport = {
            "x": this.canvas.width / 2,
            "y": this.canvas.height / 2
        }
        ctx.beginPath();
        ctx.lineWidth = this.gridMainWidth;
        // Main vertical
        ctx.moveTo(centerViewport.x + this.panOffset.x, 0);
        ctx.lineTo(centerViewport.x + this.panOffset.x, 2 * centerViewport.y);
        // Main horizontal
        ctx.moveTo(0, centerViewport.y + this.panOffset.y);
        ctx.lineTo(2 * centerViewport.x, centerViewport.y + this.panOffset.y);
        ctx.stroke();
        // Secondary vertical
        ctx.lineWidth = this.gridSecondaryWidth;
        const nVerticalSecondGridLines = Math.floor(2 * centerViewport.x / this.gridSecondaryVerticalSpacing);
        for (let i = 1; i <= Math.floor(nVerticalSecondGridLines / 2); i ++) {
            ctx.moveTo(centerViewport.x + this.panOffset.x + this.gridSecondaryVerticalSpacing * i, 0);
            ctx.lineTo(centerViewport.x + this.panOffset.x + this.gridSecondaryVerticalSpacing * i, 2 * centerViewport.y);
        }
        for (let i = 1; i <= Math.floor(nVerticalSecondGridLines / 2); i ++) {
            ctx.moveTo(centerViewport.x + this.panOffset.x - this.gridSecondaryVerticalSpacing * i, 0);
            ctx.lineTo(centerViewport.x + this.panOffset.x - this.gridSecondaryVerticalSpacing * i, 2 * centerViewport.y);
        }
        // Secondary horizontal
        const nHorizontalSecondGridLines = Math.floor(2 * centerViewport.y / this.gridSecondaryVerticalSpacing);
        for (let i = 1; i <= Math.floor(nHorizontalSecondGridLines / 2); i ++) {
            ctx.moveTo(0, centerViewport.y + this.panOffset.y + this.gridSecondaryVerticalSpacing * i);
            ctx.lineTo(2 * centerViewport.x, centerViewport.y + this.panOffset.y + this.gridSecondaryVerticalSpacing * i);
        }
        for (let i = 1; i <= Math.floor(nHorizontalSecondGridLines / 2); i ++) {
            ctx.moveTo(0, centerViewport.y + this.panOffset.y - this.gridSecondaryVerticalSpacing * i);
            ctx.lineTo(2 * centerViewport.x, centerViewport.y + this.panOffset.y - this.gridSecondaryVerticalSpacing * i);
        }
        ctx.stroke();
        
    }

    #draw(ctx) {
        this.#drawGrid(ctx);

        for (let i = 0; i < this.elements.length; i++) {
            
            if (this.isHovering && this.nearestIndex == i) {
                ctx.globalAlpha = 0.5;
            }
            else {
                ctx.globalAlpha = 1;
            }
            ctx.drawImage(
                getImage(this.elements[i].type),
                this.elements[i].loc.x + this.panOffset.x - this.elemSize / 2,
                this.elements[i].loc.y + this.panOffset.y - this.elemSize / 2,
                this.elemSize,
                this.elemSize,
            );
        }
    }
}