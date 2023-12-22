const canvasHID = document.getElementById("canvasHID");

const canvasRoulette = document.getElementById("canvasRoulette");
const ctxRoulette = canvasRoulette.getContext("2d");

const canvasElements = document.getElementById("canvasElements");
const ctxElements = canvasElements.getContext("2d");


const hid = new HID(window, canvasHID);
const elements = new Elements(hid, canvasElements);

function clearLocalStorage() {
    localStorage.clear("elements");
    elements.elements.length = 0;
}

const elementsStored = localStorage.getItem("elements");
let elementsSerialized = elementsStored ? JSON.parse(elementsStored) : null;
if (elementsSerialized) {
    elements.loadJSON(elementsSerialized)
}

const roulette = new Roulette(hid, canvasRoulette, elements);

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

animate();