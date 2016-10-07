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
                return this._onMove(action);
        }
    }

    _onMove(action) {
        const player = this._world.getPlayer(),
            bb = player.getBoundingBox();
        
        player.setXY(bb.getX() + action.getDeltaX(), bb.getY() + action.getDeltaY());
    }

    destroy() {
        this.setSource(null);
    }

}
