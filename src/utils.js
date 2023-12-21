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
    return new Point(point2.x + point1.x, point2.y + point1.y);
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