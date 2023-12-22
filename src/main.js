const canvasHID = document.getElementById("canvasHID");

const canvasRoulette = document.getElementById("canvasRoulette");
const ctxRoulette = canvasRoulette.getContext("2d");

const canvasElements = document.getElementById("canvasElements");
const ctxElements = canvasElements.getContext("2d");


const hid = new HID(window, canvasHID);
const elements = new Elements(hid, canvasElements);
const elementsSerialized = localStorage.getItem("elements");
const elementsInfo = elementsSerialized ? JSON.parse(elementsSerialized) : null;
elements.elements = elementsInfo ? elements.loadJSON(elementsInfo) : [];
const roulette = new Roulette(hid, canvasRoulette, elements);

let nElements = 0;
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

    if (nElements != elements.elements.length) {
        nElements = elements.elements.length;
        localStorage.setItem("elements", JSON.stringify(elements.elements));
    }

    roulette.update(ctxRoulette);
    elements.update(ctxElements);


    requestAnimationFrame(animate);
}

animate();