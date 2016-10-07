// vim:softtabstop=4:shiftwidth=4

import World from './World';
import Rectangle from '../geometry/Rectangle';

export default class ClientWorld extends World {

    constructor(config) {
        super(config);

        this._dirty = false;
        this._player = null;
        this._viewport = null;
        this._batchInProgress = false;

        this._viewportWidth = null;
        this._viewportHeight = null;
        this._playerPosition = null;

        this._player = config.player;
        this._viewportWidth = config.viewportWidth;
        this._viewportHeight = config.viewportHeight;

        this._viewport = new Rectangle({
            x: 0,
            y: 0,
            width: this._viewportWidth,
            height: this._viewportHeight
        });

        this._playerPosition = {
            x: Math.floor(this._viewport.getWidth() / 2),
            y: Math.floor(this._viewport.getHeight() / 2)
        };

        this._trackPlayer();
    }

    getViewport() {
        return this._viewport;
    }

    addEntity(entity) {
        if (!entity) {
            return;
        }

        super.addEntity(entity);

        // We might be called during creation without the viewport being set
        if (this._viewport && this._viewport.intersect(entity.getBoundingBox())) {
            this._onVisibleChange();
        }
    }

    removeEntity(entity) {
        if (!entity) {
            return;
        }

        if (this._viewport.intersect(entity.getBoundingBox())) {
            this._onVisibleChange();
        }

        super.removeEntity(entity);
    }

    _onEntityMove(bbOld, bbNew, entity) {
        super._onEntityMove();

        if (entity === this._player) {
            this._trackPlayer();
        }

        if (this._viewport.intersect(bbOld) || this._viewport.intersect(bbNew)) {
            this._onVisibleChange();
        }
    }

    _onVisibleChange() {
        if (this._batchInProgress) {
            this._dirty = true;
        } else {
            this.fireEvent('visibleChange');
        }
    }

    _onEntityStatsChange(entity) {
        super._onEntityStatsChange();

        if (this._viewport.intersect(entity.getBoundingBox())) {
            this._onVisibleChange();
        }
    }

    _trackPlayer() {
        const x = this.boundValue(
            this._player.getX() - this._playerPosition.x,
            0,
            this._map.getWidth() - this._viewport.getWidth()
        );
        const y = this.boundValue(
            this._player.getY() - this._playerPosition.y,
            0,
            this._map.getHeight() - this._viewport.getHeight()
        );

        this._viewport.setX(x);
        this._viewport.setY(y);
    }

    startBatchUpdate() {
        this._batchInProgress = true;
        this._dirty = false;
    }

    endBatchUpdate() {
        this._batchInProgress = false;
        if (this._dirty) {
            this.fireEvent('visibleChange');
        }
        this._dirty = false;
    }

    boundValue(value, min, max) {
        if (value < min) {
            value = min;
        } else if (value > max) {
            value = max;
        }

        return value;
    }

    getPlayer() {
        return this._player;
    }

}
