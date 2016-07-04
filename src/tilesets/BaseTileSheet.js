export default class BaseTileSheet {

    constructor() {
        this.height = null;
        this.width = null;
        this._tileWidth = null;
        this._tileHeight = null;
    }

    getHeight() {
        return this.height;
    }

    setHeight(height) {
        this.height = height;
    }

    getWidth() {
        return this.width;
    }

    setWidth(width) {
        this.width = width;
    }

    getTileWidth() {
        return this._tileWidth;
    }

    setTileWidth(tileWidth) {
        this._tileWidth = tileWidth;
    }

    getTileHeight() {
        return this._tileHeight;
    }

    setTileHeight(height) {
        this._tileHeight = height;
    }

}
