import * as _ from 'lodash';
import * as mousetrap from 'mousetrap';
import Observable from '../util/Observable';
import ControlTypes from './types';

export default class KeyboardControl extends Observable {

    constructor() {
        super();

        this._keyMap = {
            left:   ControlTypes.MOVE_LEFT,
            right:  ControlTypes.MOVE_RIGHT,
            up:     ControlTypes.MOVE_UP,
            down:   ControlTypes.MOVE_DOWN,
            'a':    ControlTypes.ATTACK
        };

        this._engaged = {};

        _.each(this._keyMap, (controlType, key) => {
            this._registerBinding(key, controlType);
        });
    }

    _registerBinding(key, controlType) {
        mousetrap.bind(key, () => {
            if (!this._engaged[controlType]) {
                this.fireEvent('engage', controlType);
            }
            this._engaged[controlType] = true;
        }, 'keydown');

        mousetrap.bind(key, () => {
            this.fireEvent('disengage', controlType);
            this._engaged[controlType] = false;
        },'keyup');
    }

}
