import * as io from 'socket.io-client';
import Observable from '../util/Observable';

import {
    unserialize as unserializeChange
} from '../change';

import {
    serialize as serializeAction
} from '../action';

export default class Client extends Observable {

    /**
     * Create an instance of the network client
     *
     */
    constructor({world, actionSource}) {
        super();

        this._generation = null;
        this._socket = null;
        this._loggedIn = false;

        this._socket = io.connect();
        this._socket.on('welcome', this._onWelcome.bind(this));
        this._socket.on('update', this._onIncomingUpdate.bind(this));
        this._socket.on('reconnect', this._onReconnect.bind(this));

        if (world) {
            this.setWorld(world);
        }

        if (actionSource) {
            this.setActionSource(actionSource);
        }
    }

    getLoggedIn() {
        return this._loggedIn;
    }

    getSocket() {
        return this._socket;
    }

    getWorld() {
        return this._world;
    }

    setWorld(world) {
        this._world = world;
    }

    _onReconnect() {
        this._loggedIn = false;
        this.fireEvent('reconnect');
    }

    _onWelcome(payload) {
        this._loggedIn = true;
        this.fireEvent('welcome', payload);
    }

    _onIncomingUpdate(payload) {
        const changeset = payload.changeset.map(unserializeChange),
            stale = (this._generation !== payload.generation),
            world = this.getWorld();

        if (!world) {
            return;
        }

        world.startBatchUpdate();

        changeset.forEach(change => change.apply(world, stale));

        world.endBatchUpdate();
    }

    setActionSource(source) {
        const listeners = {
                action: this._onAction
            };

        if (this._actionSource) {
            this._actionSource.detachListeners(listeners, this);
        }
        this._actionSource = source;
        if (this._actionSource) {
            this._actionSource.attachListeners(listeners, this);
        }
    }

    _onAction(action) {
        if (!this._loggedIn) {
            return;
        }

        this._socket.emit('action', {
            generation: ++this._generation,
            action: serializeAction(action)
        });
    }

    /**
     * Log in the user with a username
     *
     * @param {string} username
     */
    login(username) {
        this._socket.emit('login', {'username': username});
    }

}
