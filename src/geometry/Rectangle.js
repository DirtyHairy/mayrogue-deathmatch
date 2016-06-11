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
        return this;
    }

    setY(y) {
        this._y = y;
        return this;
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
        if (this._x + this._width <= rect._x) {
            return false; // this is left of rect
        }
        if (this._x >= rect._x + rect._width) {
            return false; // this is right of rect
        }
        if (this._y + this._height <= rect._y) {
            return false; // this is above rect
        }
        if (this._y >= rect._y + rect._height) {
            return false; // this is below rect
        }
        return true; // boxes overlap
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
