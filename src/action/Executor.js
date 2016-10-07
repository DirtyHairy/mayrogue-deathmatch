import types from './types';

export default class ActionExecutor {

    constructor({source, world}) {
        if (source) {
            this.setSource(source);
        }

        if (world) {
            this.setWorld(world);
        }
    }

    setWorld(world) {
        this._world = world;
    }

    setSource(source) {
        const listeners = {
            action: this._onAction
        };

        if (this._source) {
            this._source.detachListeners(listeners, this);
        }

        this._source = source;

        if (this._source) {
            this._source.attachListeners(listeners, this);
        }
    }

    _onAction(action) {
        if (!this._world) {
            return;
        }

        switch (action.type) {
            case types.MOVE:
                return this._onMove(action, this._world);

            case types.ATTACK:
                return this._onAttack(action, this._world);
        }
    }

    _onMove(action, world) {
        const player = world.getPlayer(),
            bb = player.getBoundingBox();

        player.setXY(bb.getX() + action.getDeltaX(), bb.getY() + action.getDeltaY());
    }

    _onAttack() {}

    destroy() {
        this.setSource(null);
    }

}
