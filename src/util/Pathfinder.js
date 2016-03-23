import * as gamlib from '../vendor/gamlib-ai';

export default class Pathfinder {

    constructor(width, height) {
        this._grid = new gamlib.AStarArray(width, height);
    }

    setAccessible(x, y, weight = 0) {
        this._grid.setValue(x, y, weight);
    }

    setInaccessible(x, y) {
        this._grid.setValue(x, y, -1);
    }

    findPath(x0, y0, x1, y1) {
        const path = this._grid.find(x0, y0, x1, y1);

        return path ? path.map(node => node.position) : [];
    }

    destroy() {}

}
