import Observable from '../util/Observable';
import * as _ from 'lodash';

export default class MetaControl extends Observable {

    constructor() {
        super();
        this._registry = [];
        this._controlEvents = ['engage', 'disengage'];
    }

    _createEventProxy(event) {
        return (...args) => this.fireEvent.call(this, event, ...args);
    }

    addControl(control) {
        this._registry.push(control);

        const listeners = {};
        this._controlEvents.forEach(
            event => listeners[event] = this._createEventProxy(event)
        );

        control.attachListeners(listeners, this);
    }

    removeControl(control) {
        this._registry = _.without(this._registry, control);
        control.detachAllListeners(this);
    }

    destroy() {
        this._registry.forEach(
            control => control.detachAllListeners(this)
        );
        this._registry = [];
    }

}
