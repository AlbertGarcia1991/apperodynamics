const canvasHID = document.getElementById("canvasHID");

const canvasRoulette = document.getElementById("canvasRoulette");
const ctxRoulette = canvasRoulette.getContext("2d");

const canvasElements = document.getElementById("canvasElements");
const ctxElements = canvasElements.getContext("2d");

let nElements = 0;

const hid = new HID(window, canvasHID);

function animate() {
    canvasHID.width = window.innerWidth;
    canvasHID.height = window.innerHeight;
    canvasRoulette.width = window.innerWidth;
    canvasRoulette.height = window.innerHeight;
    canvasElements.width = window.innerWidth;
    canvasElements.height = window.innerHeight;

    if (hid.mouseDownLeft && !hid.mouseDownLeft1Second) {
        hid.mouseHold();
    }

    roulette.update(ctxRoulette);
    elements.update(ctxElements);


    requestAnimationFrame(animate);
}
const elements = new Elements(hid, canvasElements);
const roulette = new Roulette(hid, canvasRoulette, elements);

animate();