import * as _ from 'lodash';
import Observable from '../util/Observable';

export default class MetaControl extends Observable {

    constructor() {
        super();
        this._registry = [];
        this._controlEvents = ['engage', 'disengage'];
    }

    _createEventProxy(event) {
        return function() {
            const args = Array.prototype.slice.call(arguments, 0);

            args.unshift(event);
            this.fireEvent.apply(this, args);
        };
    }

    addControl(control) {
        this._registry.push(control);

        const listeners = {};
        _.each(this._controlEvents, (event) => {
            listeners[event] = this._createEventProxy(event);
        });

        control.attachListeners(listeners, this);
    }

    removeControl(control) {
        this._registry = _.without(this._registry, control);
        control.detachAllListeners(this);
    }

    destroy() {
        _.each(this._registry, function(control) {
            control.detachAllListeners(this);
        });

        this._registry = [];
    }

}
