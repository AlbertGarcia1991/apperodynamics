class Point {
    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }

    print() {
        return `{${this.x},${this.y}}`;
    }

    returnCopy() {
        return new Point(this.x, this.y);
    }

    clear() {
        this.x = 0;
        this.y = 0
    }

    setValues(x, y) {
        this.x = x;
        this.y = y;
    }

    setValuesLikePoint(point) {
        this.x = point.x;
        this.y = point.y;
    }

    add(point) {
        this.x += point.x;
        this.y += point.y;
    }

    subtract(point) {
        this.x -= point.x;
        this.y -= point.y;
    }


    dotScalar(k) {
        this.x *= k;
        this.y *= k;
    }
}