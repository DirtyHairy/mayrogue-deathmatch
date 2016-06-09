import types from './types';

export default class RandomWalk {

    constructor(entity, rng, walkPropability = 0.3) {
        this._entity = entity;
        this._walkPropability = walkPropability;
        this._rng = rng;
    }

    get type() {
        return types.RANDOM_WALK;
    }

    getEntity() {
        return this._entity;
    }

    getWalkPropability() {
        return this._walkPropability;
    }

    decide() {
        if (this._rng() > this._walkPropability) {
            return null;
        }

        switch (Math.floor(4 * this._rng())) {
            case 0:
                return new Action.Move({deltaX: 1});
            case 1:
                return new Action.Move({deltaX: -1});
            case 2:
                return new Action.Move({deltaY: 1});
            case 3:
                return new Action.Move({deltaY: -1});
        }

        return null;
    }

}
