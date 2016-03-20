/* global suite, test */

import EntityManager from '../../src/entity/Manager';
import Entity from '../../src/entity/Entity';
import tiles from '../../src/tiles';
import Rectangle from '../../src/geometry/Rectangle';


import * as assert from 'assert';

suite('The entity manager', function() {

    test('Adding an entity fires "entityAdded"', function() {
        const em = new EntityManager(),
            e = new Entity();

        let eventArgs = null;

        em.attachListeners({
            entityAdded: (...args) => eventArgs = args
        });

        em.addEntity(e);

        assert.ok(!!eventArgs);
        assert.deepEqual(eventArgs, [e, em]);
    });

    test('Removing an entity fires "entityRemoved"', function() {
        const em = new EntityManager(),
            e = new Entity();

        let eventArgs = null;

        em.attachListeners({
            entityRemoved: (...args) => eventArgs = args
        });

        em.addEntity(e);
        em.removeEntity(e);

        assert.ok(!!eventArgs);
        assert.deepEqual(eventArgs, [e, em]);
    });

    test('Entity events are proxied', function() {
        const em = new EntityManager(),
            e = new Entity({x: 0});

        em.addEntity(e);

        let eventArgs = null;

        em.attachListeners({
            move: (...args) => eventArgs = args
        });

        e.setX(1);

        assert.ok(!!eventArgs);
        assert.strictEqual(eventArgs[2], e);
        assert.strictEqual(eventArgs[3], em);
    });

    test('Retrieving entities by id', function() {
        const em = new EntityManager(),
            e1 = new Entity({id: 1}),
            e2 = new Entity({id: 2});

        em
            .addEntity(e1)
            .addEntity(e2);

        assert.strictEqual(em.getEntityById(1), e1);
        assert.strictEqual(em.getEntityById(2), e2);
        assert.ok(!em.getEntityById(3));
    });

    test('Testing field and rect accessibility', function() {
        const em = new EntityManager(),
            e1 = new Entity({shape: tiles.HUNTER, x: 2, y: 2, id: 1}),
            e2 = new Entity({shape: tiles.HUNTER, x: 4, y: 4, id: 2});

        em.addEntity(e1);

        assert.ok(!em.fieldAccessible(2, 2, e2));
        assert.ok(em.fieldAccessible(2, 2, e1));
        assert.ok(em.fieldAccessible(3, 3), e1);
        assert.ok(em.rectAccessible(new Rectangle({x: 0, y: 0, width: 1.5, height: 1.5}), e2));
        assert.ok(!em.rectAccessible(new Rectangle({x: 1, y: 1, width: 1.5, height: 1.5}), e2));
    });

    test('Entites by rectangular domain', function(){
        const em = new EntityManager(),
            e1 = new Entity({x: 0, y: 0, id: 2, shape: tiles.HUNTER}),
            e2 = new Entity({x: 2, y: 2, id: 3, shape: tiles.HUNTER}),
            e3 = new Entity({x: 4, y: 4, id: 4, shape: tiles.HUNTER});

        [e1, e2, e3].forEach(entity => em.addEntity(entity));

        const comparator = (e1, e2) =>
            (e1.getId() - e2.getId()) && (e1.getId() > e2.getId() ? 1 : -1),
            projector = e => e.getId();

        assert.deepEqual(
            em.entitiesIntersectingWith(new Rectangle({x: 0, y: 0, width: 1, height: 1})).map(projector),
            [e1].map(projector)
        );
        assert.deepEqual(
            em.entitiesIntersectingWith(new Rectangle({x: 0, y: 0, width: 3, height: 3})).sort(comparator).map(projector),
            [e1, e2].map(projector)
        );
        assert.deepEqual(
            em.entitiesIntersectingWith(new Rectangle({x: 2.5, y:2.5, width: 2, height:2})).sort(comparator).map(projector),
            [e2, e3].map(projector)
        );
    });

});
