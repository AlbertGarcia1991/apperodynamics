class Elements {

    constructor(hid, canvas) {
        this.hid = hid;
        this.canvas = canvas;

        this.elements = [];
        
        this.isHovering = false;
        this.isDragging = false;
        
        this.pViewport = new Point(this.canvas.width, this.canvas.height);
        this.pCenterViewport = dotScalar(this.pViewport, 0.5);
        this.pCenterRef = this.pCenterViewport.copy();
        this.pMouseRef = new Point();

        this.panStart = new Point();
        this.panActive = false;
        
        this.zoom = 1;
        this.elemSize = 40;
        this.initElemSize = this.elemSize;

        this.gridMainWidth = 1;
        this.gridSecondaryWidth = 0.2;
        this.gridSecondaryVerticalSpacingInit = 50;
        this.gridSecondaryHorizontalSpacingInit = 20;

        this.tStart = Date.now();
    }

    loadJSON(elementsSerialized) {
        elementsSerialized.forEach((element) => {
            element.isNew = true;
            this.addElement(element)
        });
    }

    addElement(element) {
        this.elements.push({
            "type": element.type,
            "pViewport": element.locViewport,
            "pRef": this.#pFromCenter(element.locViewport)
        });
        localStorage.setItem("elements", JSON.stringify(this.elements));
    }

    update(ctx) {
        this.pViewport.update(this.canvas.width, this.canvas.height);
        this.pCenterViewport = dotScalar(this.pViewport, 0.5);
        this.pMouseRef = this.#pFromCenter(this.pCenterRef);

        this.#isZooming();
        this.#isHovering();
        this.#isRemoving();
        this.#isDragging();
        this.#isPanning();
        this.#drawGrid(ctx);
        this.#drawElements(ctx);

        // if ((Date.now() - this.tStart > 200) && this.hid.mouseDownLeft) {
        //     console.log(this.pCenterViewport, this.pCenterRef, this.hid.mouseLoc, this.pMouseRef, this.zoom);
        //     this.tStart = Date.now();
        // }
    }

    #isPanning() {
        if (this.hid.mouseDownCenter) {
            if (!this.panActive) {
                this.panStart = this.hid.mouseLoc;
                this.panActive = true;
            }
            else {
                if (this.hid.mouseMove) {
                    this.panDelta = subtract(this.hid.mouseLoc, this.panStart);
                    this.panStart.clone(this.hid.mouseLoc);
                    this.pCenterRef.subtract(this.panDelta);
                    this.elements.forEach(element => element.pViewport.subtract(this.panDelta));
                }
            }
        }
        else {
            if (this.panActive) {
                this.panActive = false;
                this.panDelta.reset();
            }
        }
    }

    #isZooming() {
        this.elements.forEach(element => {
            element.pViewport.x += element.pRef.x * (this.hid.zoom - this.zoom);
            element.pViewport.y -= element.pRef.y * (this.hid.zoom - this.zoom);
        });
        this.zoom = this.hid.zoom;
        this.elemSize = (this.initElemSize * this.zoom);
        this.gridSecondaryVerticalSpacing = this.gridSecondaryVerticalSpacingInit * this.zoom;
        this.gridSecondaryHorizontalSpacing = this.gridSecondaryHorizontalSpacingInit * this.zoom;
    }

    #isRemoving() {
        if (this.isHovering && this.hid.mouseDownRight) {
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
        if (!this.isDragging && this.isHovering && this.hid.mouseDownLeft && !this.hid.mouseDownRight) {
            this.isDragging = true;
            this.draggingElementIdx = this.nearestIndex;
            this.draggingStart = subtract(this.elements[this.draggingElementIdx].pViewport, this.hid.mouseLoc)
            console.log(this.draggingStart);
        }

        if (this.isDragging) {
            this.elements[this.draggingElementIdx].pViewport = subtract(this.draggingStart, this.hid.mouseLoc);
            // this.elements[this.draggingElementIdx].pRef = add(this.hid.mouseLoc, this.draggingOffset);
            if (!this.hid.mouseDownLeft) {
                localStorage.setItem("elements", JSON.stringify(this.elements));
                this.isDragging = false;
                // console.log(this.elements[this.draggingElementIdx].pRef.print());
            }
            this.draggingStart.reset();
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
                if (getDistancePoint2Point(this.hid.mouseLoc, this.elements[this.nearestIndex].pViewport) < this.elemSize) {
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
        this.elements.forEach(element => {
            distances.push(getDistancePoint2Point(this.hid.mouseLoc, element.pViewport))
        });
        this.nearestIndex = distances.indexOf(Math.min(...distances));
    }

    #drawGrid(ctx) {
        ctx.beginPath();
        ctx.lineWidth = this.gridMainWidth;
        // Main vertical
        ctx.moveTo(this.pCenterRef.x, 0);
        ctx.lineTo(this.pCenterRef.x, this.pViewport.y);
        // Main horizontal
        ctx.moveTo(0, this.pCenterRef.y);
        ctx.lineTo(this.pViewport.x, this.pCenterRef.y);
        ctx.stroke();

        // Secondary vertical
        ctx.lineWidth = this.gridSecondaryWidth;
        let currX = this.pCenterRef.x;
        while (currX < this.pViewport.x) {
            ctx.moveTo(currX + this.gridSecondaryVerticalSpacing, 0);
            ctx.lineTo(currX + this.gridSecondaryVerticalSpacing, this.pViewport.y);  
            currX += this.gridSecondaryVerticalSpacing;
        }
        currX = this.pCenterRef.x;
        while (currX > 0) {
            ctx.moveTo(currX - this.gridSecondaryVerticalSpacing, 0);
            ctx.lineTo(currX - this.gridSecondaryVerticalSpacing, this.pViewport.y);  
            currX -= this.gridSecondaryVerticalSpacing;
        }
        let currY = this.pCenterRef.y;
        while (currY < this.pViewport.y) {
            ctx.moveTo(0, currY + this.gridSecondaryVerticalSpacing);
            ctx.lineTo(this.pViewport.x, currY + this.gridSecondaryVerticalSpacing);
            currY += this.gridSecondaryVerticalSpacing;
        }
        currY = this.pCenterRef.y;
        while (currY > 0) {
            ctx.moveTo(0, currY - this.gridSecondaryVerticalSpacing);
            ctx.lineTo(this.pViewport.x, currY - this.gridSecondaryVerticalSpacing);
            currY -= this.gridSecondaryVerticalSpacing;
        }
        ctx.stroke();
    }

    #drawElements(ctx) {
        for (let i = 0; i < this.elements.length; i++) {
            if (this.isHovering && this.nearestIndex == i) {
                ctx.globalAlpha = 0.5;
            }
            else {
                ctx.globalAlpha = 1;
            }
            ctx.drawImage(
                getImage(this.elements[i].type),
                this.elements[i].pViewport.x - this.elemSize / 2,
                this.elements[i].pViewport.y - this.elemSize / 2,
                this.elemSize,
                this.elemSize,
            );
        }
    }

    #pFromCenter(point) {
        const p = new Point(
            point.x - this.pCenterRef.x,
            this.pCenterRef.y - point.y
        );
        p.dotScalar(1 / this.zoom)
        return p;
    }
}