import types from './types';

export default class ActionExecutor {

    constructor({source, world}) {
        this._source = null;
        this._world = null;

        if (source) {
            this.setSource(source);
        }

        if (world) {
            this.setWorld(world);
        }
    }

    setWorld(world) {
        this._world = world;

        return this;
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

        return this;
    }

    _onAction(action, originator) {
        if (!this._world) {
            return;
        }

        switch (action.type) {
            case types.MOVE:
                return this._onMove(action, this._world, originator);

            case types.ATTACK:
                return this._onAttack(action, this._world, originator);
        }
    }

    _onMove(action, world, originator) {
        originator.move(action.getDeltaX(), action.getDeltaY());
    }

    _onAttack() {}

    destroy() {
        this.setSource(null);
    }

}
