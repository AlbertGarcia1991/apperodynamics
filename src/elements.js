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
        this.gridSecondaryVerticalSpacingInit = 50;
        this.gridSecondaryHorizontalSpacingInit = 20;

        this.oldCenterViewport = Date.now();
    }

    loadJSON(elementsSerialized) {
        elementsSerialized.forEach((element) => {
            element.isNew = true;
            this.addElement(element)
        });
    }

    addElement(element) {
        this.elements.push(element);
        localStorage.setItem("elements", JSON.stringify(this.elements));
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
            for (let i = 0; i < this.elements.length; i++) {
                const center = new Point(
                    this.elements[i].locViewport.x - this.canvas.width / 2,
                    this.elements[i].locViewport.y - this.canvas.height / 2
                );
                console.log(center);
                // this.elements[i].locViewport.x = this.elements[i].locViewport.x * this.zoom;
                // this.elements[i].locViewport.y = this.elements[i].locViewport.y / this.zoom;
            }
        }
        this.gridSecondaryVerticalSpacing = this.gridSecondaryVerticalSpacingInit * this.zoom;
        this.gridSecondaryHorizontalSpacing = this.gridSecondaryHorizontalSpacingInit * this.zoom;
    }

    #checkNewElements() {
        for (let i = 0; i < this.elements.length; i++) {
            if (this.elements[i].isNew) {
                this.elements[i].locViewport = subtract(this.panOffset, this.elements[i].locViewport);
                this.elements[i].isNew = false;
                this.elements[i].locAbs = new Point(
                    this.elements[i].locViewport.x - this.canvas.width / 2,
                    this.elements[i].locViewport.y - this.canvas.height / 2,
                );
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
            if (this.elements.length == 0) {
                localStorage.clear("elements");
            }
            else
            {
                localStorage.setItem("elements", JSON.stringify(this.elements));
            }
        }
    }

    #isDragging() {
        if (!this.isDragging && this.isHovering && this.mouseDownLeft && !this.mouseDownRight) {
            this.isDragging = true;
            this.draggingOffset = new Point(
                this.elements[this.nearestIndex].locViewport.x - this.mouseLoc.x,
                this.elements[this.nearestIndex].locViewport.y - this.mouseLoc.y
            );
        }

        if (this.isDragging && this.elements[this.nearestIndex]) {
            this.elements[this.nearestIndex].locViewport = add(this.mouseLoc, this.draggingOffset);
            if (!this.mouseDownLeft) {
                localStorage.setItem("elements", JSON.stringify(this.elements));
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
        try {
        if (this.nearestIndex != null) {
            if (getDistancePoint2Point(this.mouseLoc, this.elements[this.nearestIndex].locViewport) < this.elemSize) {
                this.isHovering = true;
            }
            else {
                this.isHovering = false;
            }
        }
        } catch(err) {}
    }

    #getNearest() {
        const distances = [];
        for (let i = 0; i < this.elements.length; i++) {
            distances.push(getDistancePoint2Point(this.mouseLoc, this.elements[i].locViewport));
        }
        this.nearestIndex = distances.indexOf(Math.min(...distances));
    }

    #drawGrid(ctx) {
        this.centerViewport = new Point(this.canvas.width / 2, this.canvas.height / 2);
        this.centerAbs = add(this.centerViewport, this.panOffset);
        if (Date.now() - this.oldCenterViewport > 1000) {
            console.log("HERE", this.centerViewport, this.centerAbs);
            this.oldCenterViewport = Date.now();
        }
        ctx.beginPath();
        ctx.lineWidth = this.gridMainWidth;
        // Main vertical
        ctx.moveTo(this.centerViewport.x + this.panOffset.x, 0);
        ctx.lineTo(this.centerViewport.x + this.panOffset.x, 2 * this.centerViewport.y);
        // Main horizontal
        ctx.moveTo(0, this.centerViewport.y + this.panOffset.y);
        ctx.lineTo(2 * this.centerViewport.x, this.centerViewport.y + this.panOffset.y);
        ctx.stroke();
        // Secondary vertical
        ctx.lineWidth = this.gridSecondaryWidth;
        const nVerticalSecondGridLines = Math.floor(2 * this.centerViewport.x / this.gridSecondaryVerticalSpacing);

        let currX = this.centerAbs.x;
        while (currX < this.canvas.width) {
            ctx.moveTo(currX + this.gridSecondaryVerticalSpacing, 0);
            ctx.lineTo(currX + this.gridSecondaryVerticalSpacing, this.canvas.height);  
            currX += this.gridSecondaryVerticalSpacing;
        }
        currX = this.centerAbs.x;
        while (currX > 0) {
            ctx.moveTo(currX - this.gridSecondaryVerticalSpacing, 0);
            ctx.lineTo(currX - this.gridSecondaryVerticalSpacing, this.canvas.height);  
            currX -= this.gridSecondaryVerticalSpacing;
        }
        let currY = this.centerAbs.y;
        while (currY < this.canvas.height) {
            ctx.moveTo(0, currY + this.gridSecondaryVerticalSpacing);
            ctx.lineTo(this.canvas.width, currY + this.gridSecondaryVerticalSpacing);
            currY += this.gridSecondaryVerticalSpacing;
        }
        currY = this.centerAbs.y;
        while (currY > 0) {
            ctx.moveTo(0, currY - this.gridSecondaryVerticalSpacing);
            ctx.lineTo(2 * this.centerViewport.x, currY - this.gridSecondaryVerticalSpacing);
            currY -= this.gridSecondaryVerticalSpacing;
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
                this.elements[i].locViewport.x + this.panOffset.x - this.elemSize / 2,
                this.elements[i].locViewport.y + this.panOffset.y - this.elemSize / 2,
                this.elemSize,
                this.elemSize,
            );
        }
    }
}