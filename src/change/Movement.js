import types from './types';

export default class Movement {

    constructor({x = 0, y = 0, id = 0, heading = ''} = {}) {
        this._x = x;
        this._y = y;
        this._id = id;
        this._heading = heading;
    }

    get type() {
        return types.MOVEMENT;
    }

    getX() {
        return this._x;
    }

    setX(x) {
        this._x = x;
        return this;
    }

    getY() {
        return this._y;
    }

    setY(y) {
        this._y = y;
        return this;
    }

    getId() {
        return this._id;
    }

    setId(id) {
        this._id = id;
        return this;
    }

    getHeading() {
        return this._heading;
    }

    setHeading(heading) {
        this._heading = heading;
        return this;
    }

    /**
     * If a movement of the player entity is stale, we discard it --- avoids
     * jumping in case of pending requests.
     */
    apply(world, stale) {
        if (stale && this._id === world.getPlayer().getId()) {
            return;
        }

        const entity = world.getEntityById(this._id);
        if (entity) {
            entity.setXY(this._x, this._y, true);
            entity.setHeading(this._heading);
        }
    }

    serialize() {
        return {
            x: this._x,
            y: this._y,
            id: this._id,
            heading: this._heading
        };
    }

    static unserialize(blob) {
        return new Movement(blob);
    }

    destroy() {}

}
