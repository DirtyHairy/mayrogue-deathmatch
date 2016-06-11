import tiles from '../tiles';
import Pathfinder from './Pathfinder';

export default class Map {

    constructor(width, height) {
        this._width = width;
        this._height = height;
        this._data = this._initData();
        this._pathfinder = null;
    }

    getWidth() {
        return this._width;
    }

    getHeight() {
        return this._height;
    }

    fieldAccessible(x, y) {
        return (x >= 0) && (x < this._width) && (y >= 0) && (y < this._height) &&
            tiles.properties[this._data[x][y]].walkable;
    }

    updateField(x, y, tile) {
        this._data[x][y] = parseInt(tile, 10);
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
                if (!tiles.properties[this._data[x][y]].walkable) {
                    return false;
                }
            }
        }

        return true;
    }

    /*
     * count how many tiles around (x,y) are stone tiles (within one step)
     */
    countSurroundingStoneTiles(x, y, {corners = true, distance = 1} = {}) {
        let stoneTileCount = 0;

        for (let posX = x - distance; posX <= x + distance; posX++) {
            for (let posY = y - distance; posY <= y + distance; posY++) {

                if (posX === x && posY === y) {
                    continue;
                }

                if (!this._insideMap(posX, posY)) {
                    continue;
                }

                if (!corners && Math.abs(x - posX) === 2 && Math.abs(y - posY) === 2)  {
                    continue;
                }

                if (tiles.STONE === this._data[posX][posY] ||
                    tiles.STONE2 === this._data[posX][posY]) {
                    stoneTileCount++;
                }
            }
        }

        return stoneTileCount;
    }

    countSurroundingFloorTiles(x, y, {corners = true, distance = 1} = {}) {
        const width = 2 * distance + 1;
        let tileCount = width * width - 1;

        if (!corners) {
            tileCount -= 4;
        }

        return tileCount - this.countSurroundingStoneTiles(x, y, {corners: corners, distance: distance});
    }

    /*
     * check if x,y is a border tile
     */
    isBorder(x, y) {
        return x === 0 || y === 0 || x >= this._width - 1 || y >= this._height - 1;
    }

    _insideMap(x, y) {
        return x > 0 && x < this._width && y > 0 && y < this._height;
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

    _initData() {
        const data = [];
        for (let x = 0; x < this._width; x++) {
            data[x] = [];
            for (let y = 0;  y < this._height; y++) {
                data[x][y] = null;
            }
        }
        return data;
    }

    finalize() {
        this._pathfinder = this.createPathfinder();
    }

    createPathfinder() {
        const pathfinder = new Pathfinder();
        for (let x = 0; x < this._width; x++) {
            for (let y = 0; y < this._height; y++) {
                if (this.fieldAccessible(x, y)) {
                    pathfinder.setAccessible(x, y);
                } else {
                    pathfinder.setInaccessible(x, y);
                }
            }
        }
        return pathfinder;
    }

    findWay(x0, y0, x1, y1) {
        return this._pathfinder.findPath(x0, y0, x1, y1);
    }

}
