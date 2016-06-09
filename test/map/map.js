/* global suite, test */

import Map from '../../src/map/Map';
import * as assert from 'assert';

suite('Map tests', () => {

    test('Floor tiles in one step', () => {
        let map = new Map(10, 10);
        for (let x = 0; x < 10; x++) {
            for (let y = 0; y < 10; y++) {
                map.updateField(x, y, 6);
            }
        }

        map.updateField(8, 8, 4);
        assert.equal(map.countSurroundingFloorTiles(7, 8), 1);
        assert.equal(map.countSurroundingFloorTiles(3, 3), 0);
        assert.equal(map.countSurroundingFloorTiles(8, 8), 0);
    });

    test('Border check', () => {
        let map = new Map(3, 3);
        assert.ok(map.isBorder(0, 0));
        assert.ok(map.isBorder(0, 1));
        assert.ok(map.isBorder(0, 2));
        assert.ok(map.isBorder(1, 0));
        assert.ok(!map.isBorder(1, 1));
        assert.ok(map.isBorder(1, 2));
        assert.ok(map.isBorder(2, 0));
        assert.ok(map.isBorder(2, 1));
        assert.ok(map.isBorder(2, 2));
    });

    test('Floor tiles in two step', () => {
        let map = new Map(10, 10);
        for (let x = 0; x < 10; x++) {
            for (let y = 0; y < 10; y++) {
                map.updateField(x, y, 6);
            }
        }

        map.updateField(7, 7, 4);
        map.updateField(6, 7, 4);

        assert.equal(map.countSurroundingFloorTiles(5, 7, {distance: 2}), 2);
        assert.equal(map.countSurroundingFloorTiles(4, 7, {distance: 2}), 1);
        assert.equal(map.countSurroundingFloorTiles(3, 3, {distance: 2}), 0);
        assert.equal(map.countSurroundingFloorTiles(7, 7, {distance: 2}), 1);
    });

    test('Fields accessible', () => {

        let map = new Map(4, 4);
        for (let x = 0; x < 4; x++) {
            for (let y = 0; y < 4; y++) {
                map.updateField(x, y, "1");
            }
        }

        for (let x = 0; x < 4; x++) {
            for (let y = 0; y < 4; y++) {
                assert.ok(map.fieldAccessible(x, y));
            }
        }

    });

});
