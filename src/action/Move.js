import types from './types';
import AbstractAction from './Abstract';

export default class MoveAction extends AbstractAction {

    constructor({deltaX = 0, deltaY = 0}, deadTime) {
        super(deadTime);

        this._deltaX = deltaX;
        this._deltaY = deltaY;
    }

    getDeltaX() {
        return this._deltaX;
    }

    getDeltaY() {
        return this._deltaY;
    }

    get type() {
        return types.MOVE;
    }

    serialize() {
        return {
            deltaX: this._deltaX,
            deltaY: this._deltaY
        };
    }

    validate() {
        return ((Math.abs(this._deltaX) + Math.abs(this._deltaY)) <= 1);
    }

    static unserialize(blob) {
        return new MoveAction(blob);
    }

}
