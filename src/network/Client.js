import * as _ from 'lodash';
import * as io from 'socket.io-client';
import Observable from '../util/Observable';
import {unserialize, serialize} from '../change/index';

export default class Client extends Observable {

    /**
     * Create an instance of the network client
     *
     */
    constructor(config) {

        super();

        this._world = config.world;
        this._generation = null;
        this._actionSource = config.actionSource;
        this._socket = null;
        this._loggedIn = false;

        this._socket = io.connect();
        this._socket.on('welcome', _.bind(this._onWelcome, this));
        this._socket.on('update', _.bind(this._onIncomingUpdate, this));
        this._socket.on('reconnect', _.bind(this._onReconnect, this));
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
        const changeset = _.map(payload.changeset, unserialize),
            stale = (this._generation !== payload.generation),
            world = this.getWorld();

        if (!world) {
            return;
        }

        world.startBatchUpdate();
        _.each(changeset, (change) => {
            change.apply(world, stale);
        });
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
            action: serialize(action)
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
