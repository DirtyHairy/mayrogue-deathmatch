import Observable from '../util/Observable';
import ControlTypes from '../control/types';
import AttackAction from './Attack';
import MoveAction from './Move';

export default class ActionEmitter extends Observable {

    constructor({control}) {
        super();

        this._controlQueue = [];

        this._timeoutHandle = null;
        this._defaultDeadTime = 100;

        if (control) {
            this.setControl(control);
        }

    }

    setControl(control) {
        this._unbindControlListeners();
        this._control = control;
        this._bindControlListeners();
    }

    _unbindControlListeners() {
        if (!this._control) {
            return;
        }

        this._control.detachAllListeners(this);
    }

    _bindControlListeners() {
        if (!this._control) {
            return;
        }

        this._control.attachListeners({
            engage: this._onControlEngage,
            disengage: this._onControlDisengage
        }, this);
    }

    _onControlEngage(controlType) {
        if (this._controlQueue.indexOf(controlType) < 0) {
            this._controlQueue.unshift(controlType);
        }
        if (!this._timeoutHandle) {
            this._dispatch();
        }
    }

    _onControlDisengage(controlType) {
        this._controlQueue = this._controlQueue.filter(t => t !== controlType);
    }

    _buildAction(controlType) {
        switch(controlType) {
            case ControlTypes.ATTACK:
                return new AttackAction();

            case ControlTypes.MOVE_UP:
                return new MoveAction({deltaY: -1});

            case ControlTypes.MOVE_DOWN:
                return new MoveAction({deltaY: 1});

            case ControlTypes.MOVE_LEFT:
                return new MoveAction({deltaX: -1});

            case ControlTypes.MOVE_RIGHT:
                return new MoveAction({deltaX: 1});
        }

        return null;
    }

    _dispatch() {
        if (this._controlQueue.length > 0) {
            const action = this._buildAction(this._controlQueue[0]),
                deadTime = action ? action.getDeadTime() : this._defaultDeadTime;

            if (action) {
                this.fireEvent('action', action);
            }

            this._timeoutHandle = setTimeout(this._dispatch.bind(this), deadTime);
        } else {
            this._timeoutHandle = null;
        }
    }

    destroy() {
        this._unbindControlListeners();
    }

    busy() {
        return (!!this._timeoutHandle);
    }

}
