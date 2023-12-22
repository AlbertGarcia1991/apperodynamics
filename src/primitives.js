class Point {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    print() {
        return `{${this.x},${this.y}}`;
    }

    copy() {
        return new Point(this.x, this.y);
    }

    reset() {
        this.x = 0;
        this.y = 0
    }

    update(x, y) {
        this.x = x;
        this.y = y;
    }

    add(point) {
        this.x += point.x;
        this.y += point.y;
    }

    subtract(point) {
        this.x -= point.x;
        this.y -= point.y;
    }

    clone(point) {
        this.x = point.x;
        this.y = point.y;
    }

    dotScalar(k) {
        this.x *= k;
        this.y *= k;
    }

    addScalar(k) {
        this.x += k;
        this.y += k;
    }
}