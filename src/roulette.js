class Roulette {
    constructor(hid, canvas, elements) {
        this.hid = hid;
        this.canvas = canvas;
        this.elements = elements;

        this.isHovering = false;
        this.isDragging = false;
        this.hoverBtnIdx = null;
        this.btnClickFlag = false;
        this.btnClickIdx = null;

        this.nButtons = 8;
        this.deltaAngle = Math.PI * 2 / this.nButtons;
        this.timeStartDraggingMs = 500;
        
        this.extRad = 80;
        this.intRad = 35;
        this.margin = 20;
        this.btnImgDiameter = 30;
        this.extColorA = "red";
        this.extColorB = "orange";
        this.intColor = "blue";
        this.selectedColor = "purple";

        this.alphaWhenHovering = 0.75;
        this.alphaWhenDragging = 0.5;
        
        this.minY = this.extRad + this.margin;
        this.maxY = canvas.height - this.extRad - this.margin;
        this.minX = this.extRad + this.margin;
        this.maxX = canvas.width - this.extRad - this.margin;
        this.center = new Point(this.extRad + this.margin, this.maxY);
    }

    update(ctx) {
        // Get position of mouse
        this.mouseLoc = this.hid.mouseLoc;

        // Get mouse buttons
        this.mouseLeftDown = this.hid.mouseDownLeft;
        this.mouseRightDown = this.hid.mouseDownRight;

        this.#isHovering();
        this.#isDragging();
        
        this.#updateMargins();
        this.#draw(ctx);
        this.#btnClickAttachImg(ctx);
    }

    #isHovering() {
        this.isHovering = isPointInCircle(this.mouseLoc, this.center, this.extRad);
        if (this.#isHovering) {
            if (getDistancePoint2Point(this.mouseLoc, this.center) < this.intRad) {
                this.hoverBtnIdx = 0;
            }
            else {
                this.hoverBtnIdx = this.#getBtnQuadrant();
            }
            if (this.mouseLeftDown) {
                if (getDistancePoint2Point(this.mouseLoc, this.center) < this.intRad) {
                    if (this.timeLastBtnCenterClick == null) {
                        this.timeLastBtnCenterClick = Date.now();
                        console.log("CENTER BUTTON CLICKED");
                    }
                    if (Date.now() - this.timeLastBtnCenterClick > 1000) {
                        this.timeLastBtnCenterClick = null;
                    }
                    this.btnClickFlag = false;
                    this.btnClickIdx = null;
                }
                else if (getDistancePoint2Point(this.mouseLoc, this.center) < this.extRad) {
                    this.btnClickIdx = this.#getBtnQuadrant();
                    this.btnClickFlag = true;
                }
                else {
                    if (this.btnClickFlag) {
                        this.elements.addElement({"type": this.btnClickIdx, "locViewport": this.mouseLoc});
                    }
                    this.btnClickIdx = null;
                    this.btnClickFlag = false;
                }
            }
        }
        else {
            this.hoverBtnIdx = null;
        }
        if (this.mouseRightDown && !this.isHovering) {
            this.btnClickIdx = null;
            this.btnClickFlag = false;
        }
    }

    #btnClickAttachImg(ctx) {
        if (this.btnClickIdx > 0 && !this.isHovering) {
            ctx.drawImage(
                getImage(this.btnClickIdx),
                this.mouseLoc.x - this.btnImgDiameter / 2,
                this.mouseLoc.y - this.btnImgDiameter / 2,
                this.btnImgDiameter,
                this.btnImgDiameter,
            );
        }
    }

    #updateMargins() {
        this.minY = this.extRad + this.margin;
        this.maxY = this.canvas.height - this.extRad - this.margin;
        this.minX = this.extRad + this.margin;
        this.maxX = this.canvas.width - this.extRad - this.margin;

        if (this.center.x > this.maxX) {
            this.center.x = this.maxX;
        }
        if (this.center.x < this.minX) {
            this.center.x = this.minX;
        }
        if (this.center.y > this.maxY) {
            this.center.y = this.maxY;
        }
        if (this.center.y < this.minY) {
            this.center.y = this.minY;
        }
    }

    #isDragging() {
        if (this.isHovering && this.mouseRightDown) {
            if (!this.isDragging) {
                this.dragInitMouseOffset = subtract(this.mouseLoc, this.center);
                this.isDragging = true;
            }
        }
        if (this.mouseRightDown && this.isDragging) {
            const newCenter = add(this.mouseLoc, this.dragInitMouseOffset);
            if (newCenter.y > this.maxY) {
                newCenter.y = this.maxY;
            }
            else if (newCenter.y < this.minY) {
                newCenter.y = this.minY;
            }
            if (newCenter.x > this.maxX) {
                newCenter.x = this.maxX;
            }
            else if (newCenter.x < this.minX) {
                newCenter.x = this.minX;
            }
            this.center = newCenter;
        }
        else {
            this.isDragging = false;
        }
    }

    #draw(ctx) {
        if (this.isDragging) {
            ctx.globalAlpha = this.alphaWhenDragging;
        }

        if (this.isHovering && this.hoverBtnIdx == 0 && !this.isDragging) {
            ctx.globalAlpha = this.alphaWhenHovering;
        }
        ctx.beginPath();
        ctx.arc(this.center.x, this.center.y, this.intRad, 0, Math.PI * 2);
        if (this.btnClickIdx == 0) {
            ctx.fillStyle = this.selectedColor;
        }
        else {
            ctx.fillStyle = this.intColor;
        }
        ctx.fill();

        for (let i = 0; i < this.nButtons; i++) {
            const startAngle = i * this.deltaAngle - this.deltaAngle / 2;
            const endAngle = startAngle + this.deltaAngle;
            if (this.isHovering && this.hoverBtnIdx == i + 1 && !this.isDragging) {
                ctx.globalAlpha = this.alphaWhenHovering;
            }
            ctx.beginPath();
            ctx.arc(this.center.x, this.center.y, this.extRad, startAngle, endAngle);
            ctx.arc(this.center.x, this.center.y, this.intRad, endAngle, startAngle, true);
            if (this.btnClickIdx == i + 1) {
                ctx.fillStyle = this.selectedColor;
            }
            else {
                ctx.fillStyle = i % 2 == 0 ? this.extColorA : this.extColorB;
            }
            ctx.fill();
            if (this.isHovering && this.hoverBtnIdx == i + 1 && !this.isDragging) {
                ctx.globalAlpha = 1;
            }

            const centerAngle = (endAngle + startAngle) / 2;
            // console.log(rad2deg(centerAngle));
            ctx.drawImage(
                getImage(i + 1),
                this.center.x + ((this.extRad + this.intRad) / 2) * Math.cos(-centerAngle) - this.btnImgDiameter / 2,
                this.center.y + ((this.extRad + this.intRad) / 2) * Math.sin(centerAngle) - this.btnImgDiameter / 2,
                this.btnImgDiameter,
                this.btnImgDiameter,
            );
        }

        
    }

    #getBtnQuadrant() {
        const angle = getAngle(subtract(this.mouseLoc, this.center));
        let btn = 1 + (this.nButtons - parseInt((angle + this.deltaAngle / 2) / this.deltaAngle));
        if (btn > this.nButtons) {
            btn = 1;
        }
        return btn;
    }
}