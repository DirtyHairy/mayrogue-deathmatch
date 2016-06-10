export default class Rectangle {

    constructor({
        x = 0, y = 0, width = 0, height = 0
    } = {}) {
        this._x = x;
        this._y = y;
        this._width = width;
        this._height = height;
    }

    getX() {
        return this._x;
    }

    getY() {
        return this._y;
    }

    setX(x) {
        this._x = x;
    }

    setY(y) {
        this._y = y;
    }

    getWidth() {
        return this._width;
    }

    getHeight() {
        return this._height;
    }

    isInside(x, y) {
        return (x >= this._x) && (x < this._x + this._width) &&
            (y >= this._y) && (y < this._y + this._height);
    }

    intersect(rect) {
        return !((this._x + this._width < rect._x) ||
                 (this._x > rect._x + rect._width)  ||
                 (this._y + this._height < rect._y) ||
                 (this._y > rect._y + rect._height));
    }

    clone() {
        return new Rectangle({
            x: this._x,
            y: this._y,
            width: this._width,
            height: this._height
        });
    }

    destroy() {}
}
