import types from './types';

export default class ActionExecutor {

    constructor(config) {
        this._source = config.source;
        this._world = config.world;
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
                action.execute(this._world.getPlayer(), this._world);
                break;
        }
    }

    destroy() {
        this.setSource(null);
    }

}
