import * as path from 'path';
import * as http from 'http';
import serveStatic from 'serve-static';
import morgan from 'morgan';
import express from 'express';
import io from 'socket.io';

import World from '../world/World';
import RandomMapFactory from '../map/RandomMapFactory';
import {newDefaultGenerator} from '../random/generatorFactory';
import * as Action from '../action/index';
import tiles from '../tiles';
import Stats from '../stats/Stats';
import Entity from '../entity/Entity';
import PlayerContext from '../player/Context';
import * as Change from '../change/index';
import HoundBrain from '../entity/brain/Hound';
import ZombieBrain from '../entity/brain/Zombie';
import ActionExecutor from './action/Executor';
import ActionRelay from './action/Relay';

export default class Server {

    constructor() {
        this._port = 3000;
        this._root = path.join(__dirname, '../../dist');
        this._production = false;

        this._app = null;
        this._server = null;
        this._io = null;
        this._players = [];
        this._actionRelay = null;
        this._actionExecutor = null;
    }

    setPort(port) {
        this._port = port;
    }

    setProductionMode(production) {
        this._production = production;
    }

    start() {
        this._app = express();
        this._server = http.createServer(this._app);

        if (!this._production) {
            this._app.use(morgan('dev'));
        }

        this._initWorld();
        this._initSimulationEngine();

        this._initMiddleware();

        this._io = io(this._server);
        this._bindConnectionHandlers();

        this._server.listen(this._port);
        mayrogue.log.info(`server running, listening on port ${this._port}`);

        for (let i = 0; i < 40; i++) {
            this._createMonster();
        }

        this._startHartbeat();
    }

    _initMiddleware() {
        this._app.use(serveStatic(this._root));
    }

    _initWorld() {
        const factory = new RandomMapFactory(
            35,
            40,
            newDefaultGenerator()
        );
        const map = factory.create();

        this._world = new World({map: map});
    }

    _initSimulationEngine() {
        this._actionRelay = new ActionRelay();

        this._actionExecutor = new ActionExecutor({
            source: this._actionRelay,
            world: this._world
        });
    }

    // TODO: this should be refactored into a playerConnection class
    _bindConnectionHandlers() {
        this._io.on('connection', (socket) => {
            let playerContext = null,
                player = null;

            socket.on('login', (data) => {
                playerContext = this._initPlayer(socket, data.username);
                player = playerContext.getEntity();
                this._addPlayer(playerContext);

                // We only push the player himself during init, the remaining
                // entities will be part of the first update
                socket.emit('welcome', {
                    map: this._world.getMap().serialize(),
                    entities: [player.serialize()],
                    playerId: player.getId()
                });
            });

            socket.on('action', (data) => {
                if (!playerContext) {
                    return;
                }

                const action = Action.unserialize(data.action);

                this._actionRelay.dispatchAction(action, playerContext.getEntity());

                playerContext.setGeneration(data.generation);
            });

            socket.on('disconnect', () => {
                if (player) {
                    this._world.removeEntity(player);
                }
                this._removePlayer(playerContext);
            });
        });
    }

    _initPlayer(socket, username) {

        const shapes = {
            0: tiles.HUNTER,
            1: tiles.WARRIOR,
            2: tiles.MAGE
        };

        const rng = newDefaultGenerator();

        const player = this._world.addNewRandomEntity({
            shape: shapes[Math.floor(rng() * Object.keys(shapes).length)],
            stats: new Stats({
                hp: 20,
                maxHp: 20,
                name: username
            }),
            role: Entity.PLAYER
        });

        const playerContext = new PlayerContext({
            entity: player,
            connection: socket
        });

        return playerContext;
    }

    _addPlayer(playerContext) {
        this._players.push(playerContext);
    }

    _removePlayer(playerContext) {
        const i = this._players.indexOf(playerContext);
        if (i !== -1) {
            this._players.splice(i, 1);
        }
    }

    _processCycle() {

        for (let entity of this._world.getEntities()) {
            let action = entity.tick();

            if (action) {
                this._actionRelay.dispatchAction(action, entity);
            }
        }

        for (let player of this._players) {
            let changeset = this._world.pickupChangeset(player);

            if (changeset.length > 0) {
                player.getConnection().volatile.emit('update', {
                    generation: player.getGeneration(),
                    changeset: changeset.map(Change.serialize)
                });
            }
        }

        this._world.clearChanges();
    }

    _startHartbeat() {
        setInterval(() => this._processCycle(), 200);
    }

    _createMonster() {
        const rng = newDefaultGenerator();

        const shapes = [
            tiles.LICHKING,
            tiles.OGRE,
            tiles.SPIDER,
            tiles.SNAKE,
            tiles.CTHULHU_GUY
        ];
        const shape = shapes[Math.floor(rng() * shapes.length)];

        const entity = this._world.addNewRandomEntity({
            shape: shape,
            stats: new Stats({
                hp: 10,
                maxHp: 10
            })
        });

        let brain = null;
        if (rng() < 0.3) {
            brain = new HoundBrain(rng);
        } else {
            brain = new ZombieBrain(rng);
        }

        entity.replaceBrain(brain);
    }
}
