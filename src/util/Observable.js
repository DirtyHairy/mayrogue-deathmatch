import * as _ from 'lodash';

export default class Observable {

    constructor() {
        this._listeners = {};
        this._relays = [];
    }

    /**
     * Attach event listeners. Arguments are an associative array of event
     * <-> handler pairs, scope is the execution scope if the handlers.
     */
    attachListeners(listeners, scope) {
        _.each(listeners, (handler, evt) => {
            if (!this._listeners[evt]) {
                this._listeners[evt] = [];
            }

            this._listeners[evt].push({
                callback: handler,
                scope: scope
            });
        });
    }

    attachRelay(handler, scope) {
        this._relays.push({
            handler: handler,
            scope: scope
        });
    }

    /**
     * Detach event handlers. Signature is identical to attachListeners.
     * IMPORTANT: Both scope and handler must match those passed during
     * registration.
     */
    detachListeners(listeners, scope) {
        _.each(listeners, (handler, evt) => {
            if (!this._listeners[evt]) {
                return;
            }

            this._listeners[evt] = _.reject(
                this._listeners[evt],
                listener => listener.callback === handler && listener.scope === scope
            );
        });
    }

    detachRelay(handler, scope) {
        this._relays = _.reject(
            this._relays,
            relay => handler === relay.handler && scope === relay.scope
        );
    }

    /**
     * Detach all handlers registered with a given scope.
     */
    detachAllListeners(scope) {
        _.each(this._listeners, (listeners, evt) => this._listeners[evt] = _.reject(
                this._listeners[evt],
                listener => listener.scope === scope
            )
        );
    }

    detachAllRelays(scope) {
        this._relays = _.reject(
            this._relays,
            relay => scope === relay.scope
        );
    }

    detachAll(scope) {
        this.detachAllListeners(scope);
        this.detachAllRelays(scope);
    }

    /**
     * Trigger an event. First argument is the event name, all other
     * arguments are directly passed to the handler. The sender is available as last argument.
     */
    fireEvent(...args) {
        this._handleListeners(...args);
        this._handleRelays(...args);
    }

    _handleListeners(evt, ...args) {
        if (!this._listeners[evt]) {
            return;
        }

        args.push(this);

        _.each(this._listeners[evt], listener => listener.callback.apply(listener.scope, args));
    }

    _handleRelays(...args) {
        if (this._relays.length === 0) {
            return;
        }

        args.push(this);

        _.each(this._relays, relay => relay.handler.apply(relay.scope, args));
    }

    /**
     * Destructor: detach all listeners
     */
    destroy() {
        this.listeners = {};
    }

}
