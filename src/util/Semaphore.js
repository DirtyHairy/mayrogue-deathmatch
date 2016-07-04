import * as _ from 'lodash';

/**
 * Semaphore. A semaphore is a counter which can be lowered and raised;
 * callbacks can be registered which are fired whenever the semaphore
 * aquires a certain value (trippoint).
 */
export default class Semaphore {

    constructor(initial) {
        this._trippoints = [];
        this._value = initial;
    }

    when(value, handler) {
        if (!this._trippoints[value]) {
            this._trippoints[value] = [];
        }
        this._trippoints[value].push(handler);
    }

    _handle() {
        if (!this._trippoints[this._value]) {
            return;
        }
        _.each(this._trippoints[this._value], (handler) => {
            handler();
        });
    }

    raise() {
        this._value++;
        this._handle();
    }

    lower() {
        this._value--;
        this._handle();
    }

}
