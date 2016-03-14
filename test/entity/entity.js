/* global test, suite, setup */

import Entity from '../../src/entity/Entity';
import tiles from '../../src/tiles';
import * as assert from 'assert';

suite('Entity', function() {

    let entity;

    setup(() => entity = new Entity({
        x: 0,
        y: 0
    }));

    test('mutating the heading fires an event', function() {
        let fired = 0;

        entity.attachListeners({
            change: () => fired++
        }, null);

        entity.setHeading('north').setHeading('north');

        assert.strictEqual(fired, 1);
    });

    test('changing position only works if the field is accessible or if movement is forced', function() {
        entity.setWorld({rectAccessible: () => true});

        assert.deepEqual([entity.getX(), entity.getY()], [0, 0]);

        entity.setXY(2, 3);
        assert.deepEqual([entity.getX(), entity.getY()], [2, 3]);

        entity.setWorld({rectAccessible: () => false});

        entity.setXY(4, 5);
        assert.deepEqual([entity.getX(), entity.getY()], [2, 3]);

        entity.setXY(4, 5, true);
        assert.deepEqual([entity.getX(), entity.getY()], [4, 5]);
    });

    function testHeadingAfterMove(fieldAccessible) {
        [
            [1, 0, 'east'],
            [-1, 0, 'west'],
            [0, -1, 'north'],
            [0, 1, 'south']
        ].forEach(([x, y, heading]) =>
            test(`heading is set correctly after moving ${heading}, field ${fieldAccessible ? 'accessible' : 'blocked'}`, function() {
                entity.setWorld({rectAccessible: () => fieldAccessible});
                entity.setXY(x, y);
                assert.strictEqual(entity.getHeading(), heading);
            })
        );
    }

    testHeadingAfterMove(true);
    testHeadingAfterMove(false);

    test(`(de)serialization`, function() {
        const e1 = new Entity({
                shape: tiles.HUNTER,
                role: 1,
                heading: 'west',
                id: 666,
                map: {},
                x: 10,
                y: 1
            }),
            e2 = Entity.unserialize(e1.serialize());

        assert.deepEqual(e1.serialize(), e2.serialize());
    });

});
