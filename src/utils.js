function isPointInCircle(point, center, rad, offset = 0) {
    if (getDistancePoint2Point(point, center) <= rad + offset) {
        return true;
    }
    return false;
}

function getModulus(point) {
    return Math.hypot(point.x, point.y);
}

function getAdd(point1, point2) {
    return new Point(point1.x + point2.x, point1.y + point2.y);
}

function getDotScalar(point1, k) {
    return new Point(point1.x * k, point1.y * k);
}

function getSubtract(point1, point2) {
    return new Point(point1.x - point2.x, point1.y - point2.y);
}

function getDistancePoint2Point(point1, point2) {
    const distance_vector = getSubtract(point1, point2);
    return getModulus(distance_vector);
}

function getAngle(point, rad = true) {
    const angle = Math.PI - Math.atan2(point.y, point.x);
    if (rad) {
        return angle;
    }
    return rad2deg(angle);
}

function rad2deg(angle) {
    return angle * (360 / (2 * Math.PI));
}

function getImage(type) {
    const img = new Image();
    switch (type) {
        case 1:
            img.src = "imgs/source.png";
            break;
        case 2:
            img.src = "imgs/vortex.png";
            break;
        case 3:
            img.src = "imgs/dipole.png";
            break;
        case 4:
            img.src = "imgs/corner.png";
            break;
        case 5:
            img.src = "imgs/oval.png";
            break;
        case 6:
            img.src = "imgs/cylinder.png";
            break;
        case 7:
            img.src = "imgs/polyline.png";
            break;
        case 8:
            img.src = "imgs/bezier.png";
            break;
    }
    return img;
}

class Queue {
    constructor() {
      this.elements = {};
      this.head = 0;
      this.tail = 0;
    }
    enqueue(element) {
      this.elements[this.tail] = element;
      this.tail++;
    }
    dequeue() {
      const item = this.elements[this.head];
      delete this.elements[this.head];
      this.head++;
      return item;
    }
    peek() {
      return this.elements[this.head];
    }
    get length() {
      return this.tail - this.head;
    }
    get isEmpty() {
      return this.length === 0;
    }
  }