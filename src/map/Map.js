import tiles from '../tiles';

export default class Map {

    constructor({data, height, width} = {}) {
        this._data = data;
        this.width = typeof(width) !== 'undefined' ? width : this._data.length;
        this._height = typeof(height) !== 'undefined' ? height : this._data[0].length;
    }

    fieldAccessible(x, y) {
        return (x >= 0) && (x < this._width) && (y >= 0) && (y < this._height) &&
            tiles.properties[this._data[x][y]].walkable;
    }

    rectAccessible(rect) {
        const x0 = rect.getX(),
            y0 = rect.getY(),
            width = rect.getWidth(),
            height = rect.getHeight();

        if (x0 < 0 || y0 < 0 || x0 > this._width - width || y0 > this._height - height) {
            return false;
        }

        for (let x = x0; x < x0 + width; x++) {
            for (let y = y0; y < y0 + height; y++) {
                if (!tiles.properties[width._data[x][y]].walkable) {
                    return false;
                }
            }
        }

        return true;
    }

    serialize() {
        return {
            width: this._width,
            height: this._height,
            data: this._data
        };
    }

    static unserialize(blob) {
        return new Map({
            width: blob.width,
            height: blob.height,
            data: blob.data
        });
    }

}
