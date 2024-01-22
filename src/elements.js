class Elements {

    constructor(hid, canvas) {
        this.hid = hid;
        this.canvas = canvas;
        
        this.elementsQueue = new Queue();
        this.elements = [];
        
        this.isHovering = false;
        this.isDragging = false;
        this.isPanning = false;
        
        this.pView = new Point(this.canvas.width, this.canvas.height);
        this.pViewOrigin = getDotScalar(this.pView, 0.5).returnCopy();

        this.panStart = new Point();
        
        this.zoom = 1;
        this.elemSize = 40;
        this.initElemSize = this.elemSize;

        this.gridLineWidthMain = 1;
        this.gridLineWidthSecondary = 0.2;
        this.gridSpacingInit = 50;

        this.tStart = Date.now();
    }

    loadJSON(elementsSerialized) {
        elementsSerialized.forEach((element) => {
            element.isNew = true;
            this.addElement(element)
        });
    }

    addElement(element) {
        this.elementsQueue.enqueue({
            "type": element.type,
            "pView": element.pView
        });
        localStorage.setItem("elements", JSON.stringify(this.elements));
    }

    update(ctx) {
        this.pView.setValues(this.canvas.width, this.canvas.height);

        this.#checkNewElements();
        
        this.#isPanning();
        this.#isZooming();

        this.#isHovering();
        this.#isRemoving();
        this.#isDragging();

        this.#drawGrid(ctx);
        this.#drawElements(ctx);

        // this.#printEveryMs(500);

    }

    #checkNewElements() {
        if ((!this.elementsQueue.isEmpty) && (!this.hid.mouseDownLeft)) {
            const element = this.elementsQueue.dequeue();
            console.log("Element added; pView: ", element.pView.print(), "\tpRef: ", this.#pViewToRef(element.pView).print());
            this.elements.push(element);
        }
    }
    
    #printEveryMs(ms = 200) {
        if (Date.now() - this.tStart > ms) {
            console.log(this.pViewOrigin.print());
            this.tStart = Date.now();
        }
    }

    #isPanning() {
        if (this.hid.mouseDownCenter) {
            if (!this.isPanning) {
                this.panStart = this.hid.mouseLoc;
                this.isPanning = true;
            }
            else {
                if (this.hid.mouseMove) {
                    this.panDelta = getSubtract(this.panStart, this.hid.mouseLoc);
                    this.panStart.setValuesLikePoint(this.hid.mouseLoc);
                    this.pViewOrigin.subtract(this.panDelta);
                    this.elements.forEach(element => element.pView.subtract(this.panDelta));
                }
            }
        }
        else {
            if (this.isPanning) {
                this.isPanning = false;
                this.panDelta.clear();
            }
        }
    }

    #isZooming() {
        if (this.zoom != this.hid.zoom) {
            this.elements.forEach(element => {
                const pRef = this.#pViewToRef(element);
                pRef.dotScalar(this.zoom - this.hid.zoom);
                element.pView = this.#pRefToView(pRef);
                console.log(this.hid.zoom, pRef, element.pView);
            });
            this.elemSize = (this.initElemSize * (1 / this.hid.zoom));
            this.zoom = this.hid.zoom;
            this.gridSpacing = this.gridSpacingInit * (1 / this.hid.zoom);
        }
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
            this.draggingStart = getSubtract(this.hid.mouseLoc, this.elements[this.draggingElementIdx].pView);
        }

        if (this.isDragging) {
            this.elements[this.draggingElementIdx].pView = getSubtract(this.hid.mouseLoc, this.draggingStart);
            if (!this.hid.mouseDownLeft) {
                console.log(this.#pViewToRef(this.elements[this.draggingElementIdx].pView).print());
                this.isDragging = false;
                localStorage.setItem("elements", JSON.stringify(this.elements));
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
            this.isHovering = false;
            this.nearestIndex = null;
        }
        try {
            if (this.nearestIndex != null) {
                if (getDistancePoint2Point(this.hid.mouseLoc, this.elements[this.nearestIndex].pView) < this.elemSize) {
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
            distances.push(getDistancePoint2Point(this.hid.mouseLoc, element.pView))
        });
        this.nearestIndex = distances.indexOf(Math.min(...distances));
    }

    #drawGrid(ctx) {
        ctx.beginPath();
        ctx.lineWidth = this.gridLineWidthMain;
        // Main vertical
        ctx.moveTo(this.pViewOrigin.x, 0);
        ctx.lineTo(this.pViewOrigin.x, this.pView.y);
        // Main horizontal
        ctx.moveTo(0, this.pViewOrigin.y);
        ctx.lineTo(this.pView.x, this.pViewOrigin.y);
        ctx.stroke();

        // Secondary vertical
        ctx.lineWidth = this.gridLineWidthSecondary;
        let currX = this.pViewOrigin.x;
        while (currX < this.pView.x) {
            ctx.moveTo(currX + this.gridSpacing, 0);
            ctx.lineTo(currX + this.gridSpacing, this.pView.y);  
            currX += this.gridSpacing;
        }
        currX = this.pViewOrigin.x;
        while (currX > 0) {
            ctx.moveTo(currX - this.gridSpacing, 0);
            ctx.lineTo(currX - this.gridSpacing, this.pView.y);  
            currX -= this.gridSpacing;
        }
        let currY = this.pViewOrigin.y;
        while (currY < this.pView.y) {
            ctx.moveTo(0, currY + this.gridSpacing);
            ctx.lineTo(this.pView.x, currY + this.gridSpacing);
            currY += this.gridSpacing;
        }
        currY = this.pViewOrigin.y;
        while (currY > 0) {
            ctx.moveTo(0, currY - this.gridSpacing);
            ctx.lineTo(this.pView.x, currY - this.gridSpacing);
            currY -= this.gridSpacing;
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
                this.elements[i].pView.x - this.elemSize / 2,
                this.elements[i].pView.y - this.elemSize / 2,
                this.elemSize,
                this.elemSize,
            );
        }
    }

    #pViewToRef(point) {
        const p = new Point(
            point.x - this.pViewOrigin.x,
            this.pViewOrigin.y - point.y
        );
        return p;
    }

    #pRefToView(point) {
        const p = new Point(
            this.pViewOrigin.x - point.x,
            point.y - this.pViewOrigin.y
        );
        return p;
    }
}