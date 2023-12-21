class HID {
    #maxZoom = 5

    constructor(window, canvas) {
        this.window = window;
        this.canvas = canvas;

        this.mouseLoc = [];
        this.mouseInWindow;
        
        this.mouseDownLeft = false;
        this.mouseDownTime = null;
        this.mouseDownHoldTime = 0;
        this.mouseDownLeft1Second = false;
        this.mouseDownCenter = false;
        this.mouseDownRight = false;
        this.mouseMove = false;
        this.zoom = 1;
        this.keyDown = null;

        this.#addEventListeners();
    }

    #addEventListeners() {
        this.canvas.addEventListener("contextmenu", (evt) => evt.preventDefault());
        this.window.addEventListener("mousemove", (e) => this.mouseLoc = new Point(e.offsetX, e.offsetY));
        this.canvas.addEventListener("mouseout", this.#eventListenerMouseOut.bind(this));
        this.canvas.addEventListener("mouseenter", this.#eventListenerMouseIn.bind(this));
        this.canvas.addEventListener("mousedown", this.#eventListenerMouseDown.bind(this));
        this.canvas.addEventListener("mouseup", this.#eventListenerMouseUp.bind(this));
        this.canvas.addEventListener("mousewheel", this.#eventListenerMouseZoom.bind(this));
        this.canvas.addEventListener("mousemove", this.#eventListenerMouseMove.bind(this));

        this.window.addEventListener("keydown", this.#eventListenerKeyDown.bind(this));
        this.window.addEventListener("keyup", this.#eventListenerKeyUp.bind(this));
    }

    #eventListenerMouseMove(e) {
        this.mouseMove = true;
    }

    #eventListenerMouseZoom(e) {
        const dir = Math.sign(e.deltaY);
        const step = 0.1;
        this.zoom += dir * step;
        this.zoom = Math.max(1, Math.min(this.#maxZoom, this.zoom));
    }

    #eventListenerMouseOut(e) {
        this.mouseInWindow = false;
        this.mouseDownLeft = false;
        this.mouseDownLeft1Second = false;
        this.mouseDownTime = null;
        this.keyDown = null;
        this.mouseDownCenter = false;
        this.mouseDownRight = false;
    } 

    #eventListenerMouseIn(e) {
        this.mouseInWindow = true;
    } 

    #eventListenerMouseDown(e) {
        if (e.button == 0) {
            this.mouseDownLeft = true;
            if (!this.mouseDownTime) {
                this.mouseDownTime = Date.now();
            }
        }
        else if (e.button == 1) {
            this.mouseDownCenter = true;
        }
        else if (e.button == 2) {
            this.mouseDownRight = true;
        }
    } 

    #eventListenerMouseUp(e) {
        if (e.button == 0) {
            this.mouseDownLeft = false;
            this.mouseDownLeft1Second = false;
            this.mouseDownTime = null;
        }
        else if (e.button == 1) {
            this.mouseDownCenter = false;
        }
        else if (e.button == 2) {
            this.mouseDownRight = false;
        }
    } 

    #eventListenerKeyDown(e) {
        if (this.mouseInWindow) {
            this.keyDown = e.key;
        }
    }

    #eventListenerKeyUp(e) {
        this.keyDown = null;
    }

    mouseHold() {
        this.mouseDownHoldTime = Date.now() - this.mouseDownTime;
        if (Date.now() - this.mouseDownTime > 1000) {
            this.mouseDownLeft1Second = true;
        }
    }
}