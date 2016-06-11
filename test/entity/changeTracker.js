/* global suite, test, setup */

import PlayerContext from '../../src/player/Context';
import Entity from '../../src/entity/Entity';
import EntityManager from '../../src/entity/Manager';
import ChangeTracker from '../../src/entity/ChangeTracker';
import Stats from '../../src/stats/Stats';
import tiles from '../../src/tiles';
import changeTypes from '../../src/change/types';

import * as assert from 'assert';

suite('Server-side entity manager', function() {

    let playerEntity, context, em, stats, e1, e2, e3, tracker;

    setup(function() {
        stats = new Stats({
            hp: 30,
            maxHp : 30,
            name: 'foo'
        });

        playerEntity = new Entity({
            x: 5,
            y: 5,
            id: 0,
            role: Entity.Player,
            stats: stats,
            tile: tiles.HUNTER
        });

        e1 = new Entity({
            x: 1,
            y: 1,
            id: 1,
            role: Entity.NPC,
            tiles: tiles.HUNTER
        });

        e2 = new Entity({
            x: 2,
            y: 2,
            id: 2,
            role: Entity.NPC,
            tiles: tiles.HUNTER
        });

        e3 = new Entity({
            x: 3,
            y: 3,
            id: 3,
            role: Entity.NPC,
            tiles: tiles.HUNTER
        });

        context = new PlayerContext({
            entity: playerEntity
        });

        em = new EntityManager();

        em
            .addEntity(playerEntity)
            .addEntity(e1)
            .addEntity(e2)
            .addEntity(e3);

        tracker = new ChangeTracker(em);
    });

    test('Initial changeset contains all entities within tracking domain', function() {
        const changes = tracker.pickupChangeset(context);

        assert.deepEqual(changes.map(c => c.type), Array.fill(new Array(4), changeTypes.ADD_ENTITY));
        assert.deepEqual(
            changes.map(c => c.getEntity().getId()).sort(),
            [0, 1, 2, 3]
        );
    });

    test('Initial changeset contains only entities within tracking domain', function() {
        e2.setXY(100, 100);

        const changes = tracker.pickupChangeset(context);

        assert.deepEqual(changes.map(c => c.type), Array.fill(new Array(3), changeTypes.ADD_ENTITY));
        assert.deepEqual(
            changes.map(c => c.getEntity().getId()).sort(),
            [0, 1, 3]
        );
    });

    test('Changeset after noop is empty', function() {
        tracker.pickupChangeset(context);
        tracker.clearChanges();

        const changes = tracker.pickupChangeset(context);
        assert.deepEqual(changes, []);
    });

    test('Stats changes generate a change', function() {
        tracker.pickupChangeset(context);
        tracker.clearChanges();

        playerEntity.getStats().setHp(5);
        const changes = tracker.pickupChangeset(context);

        assert.deepEqual(changes.map(c => c.type), [changeTypes.STATS]);
        assert.strictEqual(changes[0].getHp(), 5);
    });

    test('Entities leaving the domain generate a change', function() {
        tracker.pickupChangeset(context);
        tracker.clearChanges();

        e1.setXY(100, 100);

        const changes = tracker.pickupChangeset(context);
        assert.deepEqual(changes.map(c => c.type), [changeTypes.REMOVE_ENTITY]);
        assert.deepEqual(changes.map(c => c.getId()), [1]);
    });

    test('Entities entering the domain generate a change', function() {
        e3.setXY(100, 100);
        tracker.pickupChangeset(context);
        tracker.clearChanges();

        e3.setXY(0, 0);
        const changes = tracker.pickupChangeset(context);

        assert.deepEqual(changes.map(c => c.type), [changeTypes.ADD_ENTITY]);
        assert.deepEqual(changes.map(c => c.getEntity().getId()), [3]);
    });

    test('Movements generate a change', function() {
        tracker.pickupChangeset(context);
        tracker.clearChanges();

        e2.setXY(0, 0);
        const changes = tracker.pickupChangeset(context);

        assert.deepEqual(changes.map(c => c.type), [changeTypes.MOVEMENT]);
        assert.deepEqual(changes.map(c => c.getId()), [2]);
    });

    test('Add and move only generates one change', function() {
        const e4 = new Entity({
            x: 4,
            y: 4,
            id: 4,
            role: Entity.NPC,
            tiles: tiles.HUNTER
        });

        tracker.pickupChangeset(context);
        tracker.clearChanges();

        em.addEntity(e4);
        e4.setXY(0, 0);
        const changes = tracker.pickupChangeset(context);

        assert.deepEqual(changes.map(c => c.type), [changeTypes.ADD_ENTITY]);
        assert.deepEqual(changes.map(c => c.getEntity().getId()), [4]);
    });

});
