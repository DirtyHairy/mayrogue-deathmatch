export default class MapView {

    constructor({tiles, canvas}) {
        this._world = null;
        this._tiles = tiles;
        this._canvas = canvas;
        this._context = null;

        this._context = this._canvas.getContext('2d');
        this._context.fillStyle = '#FFFFFF';
    }

    getWorld() {
        return this._world;
    }

    setWorld(world) {
        const listeners = {
            visibleChange: this.redraw
        };

        if (this._world) {
            this._world.detachListeners(listeners, this);
        }
        this._world = world;
        if (this._world) {
            this._canvas.width = this._tiles.width * this._world.getViewport().getWidth();
            this._canvas.height = this._tiles.height * this._world.getViewport().getHeight();

            this._world.attachListeners(listeners, this);
            this.redraw();
        }
    }

    destroy() {
        this.setWorld(null);
    }

    redraw() {
        let x, y;
        const mapData = this._world.getMapData();
        const viewport = this._world.getViewport();
        let x0 = viewport.getX(), y0 = viewport.getY();

        for (x = x0; x < x0 + viewport.getWidth(); x++) {
            for (y = y0; y < y0 + viewport.getHeight(); y++) {
                this._tiles.drawWorldTo(
                    this._context,
                    this._tiles.width * (x - x0),
                    this._tiles.height * (y - y0),
                    mapData[x][y]
                );
            }
        }

        for (let entity of this._world.getEntities()) {
            this._tiles.drawEntityTo(
                this._context,
                this._tiles.width * (entity.getX() - x0),
                this._tiles.height * (entity.getY() - y0),
                entity
            );
        }
    }

}
