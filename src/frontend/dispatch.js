import * as _ from 'lodash';
import StatsView from './StatsView';
import MapView from './MapView';
import OryxTileSheet from './tilesets/Oryx';
import MetaControl from '../control/Meta';
import KeyboardControl from '../control/Keyboard';
import TouchControl from '../control/Touch';
import ActionEmitter from '../action/Emitter';
import ActionExecutor from '../action/Executor';
import Client from '../network/Client';
import ClientWorld from '../world/ClientWorld';
import Entity from '../entity/entity';
import Map from '../map/Map';

export default function startDispatcher(username, forceTouch) {

    const touchAvailable = function() {
        return (forceTouch || ('ontouchstart' in window) || (navigator.msMaxTouchPoints > 0));
    };

    const statsView = new StatsView({
        elt: document.getElementById('stats')
    });

    const mapView = new MapView({
        tiles: OryxTileSheet,
        canvas: document.getElementById('stage')
    });

    const control = new MetaControl();
    control.addControl(new KeyboardControl());
    if (touchAvailable()) {
        control.addControl(new TouchControl(
            {
                controlElement: document.getElementById('player_control'),
                canvasElement: document.getElementById('stage')
            }
        ));
    }

    const actionEmitter = new ActionEmitter({
        control: control
    });

    const actionExecutor = new ActionExecutor({
        source: actionEmitter
    });

    const client = new Client({
        actionSource: actionEmitter
    });

    const initWorld = function(map, entities, player) {
        const oldWorld = client.getWorld();
        if (oldWorld) {
            oldWorld.destroy();
        }

        const world = new ClientWorld({
            map: map,
            player: player,
            entities: entities,
            viewportWidth: 20,
            viewportHeight: 15
        });

        mapView.setWorld(world);
        statsView.setPlayer(player);

        actionExecutor.setWorld(world);
        client.setWorld(world);
    };

    client.attachListeners({
        welcome: (payload) => {
            const map = Map.unserialize(payload.map);

            const entities = payload.entities.map((record) => {
                return Entity.unserialize(record);
            });

            const player = _.find(entities, (entity) => {
                return entity.getId() === payload.playerId;
            });

            OryxTileSheet.ready.then(() => {
                initWorld(map, entities, player);
            });
        },
        reconnect: () => {
            client.login(username);
        }
    }, window);

    client.login(username);
}
