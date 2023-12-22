function isPointInCircle(point, center, rad, offset = 0) {
    if (getDistancePoint2Point(point, center) <= rad + offset) {
        return true;
    }
    return false;
}

function getModulus(point) {
    return Math.hypot(point.x, point.y);
}

function add(point1, point2) {
    return new Point(point1.x + point2.x, point1.y + point2.y);
}

function addScalar(point1, k) {
    return new Point(point1.x + k, point1.y + k);
}

function dotScalar(point1, k) {
    return new Point(point1.x * k, point1.y * k);
}

function subtract(point1, point2) {
    return new Point(point2.x - point1.x, point2.y - point1.y);
}

function getDistancePoint2Point(point1, point2) {
    const distance_vector = subtract(point1, point2);
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

function remainderMod(n, d) {
    var q = parseInt(n / d);  // truncates to lower magnitude
    return n - (d * q);
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