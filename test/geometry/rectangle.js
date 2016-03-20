/* global suite, test */

import Rectangle from '../../src/geometry/Rectangle';
import * as assert from 'assert';

suite('Rectangles', function() {

    test('Point inside', function() {
        const r = new Rectangle({
            x: -1,
            y: -1,
            width: 2,
            height: 2
        });

        assert.ok(r.isInside(0, 0));
    });


    test('Point outside', function() {
        const r = new Rectangle({
            x: -1,
            y: -1,
            width: 2,
            height: 2
        });

        assert.ok(!r.isInside(2, 2));
    });

    test('The left edge is part of the rectangle', function() {
        const r = new Rectangle({
            x: -1,
            y: -1,
            width: 1,
            height: 1
        });

        assert.ok(r.isInside(-1, -0.5));
    });

    test('The top edge is part of the rectangle', function() {
        const r = new Rectangle({
            x: -1,
            y: -1,
            width: 1,
            height: 1
        });

        assert.ok(r.isInside(-0.5, -1));
    });


    test('The right edge is not part of the rectangle', function() {
        const r = new Rectangle({
            x: -1,
            y: -1,
            width: 1,
            height: 1
        });

        assert.ok(!r.isInside(0, -0.5));
    });

    test('The bottom edge is not part of the rectangle', function() {
        const r = new Rectangle({
            x: -1,
            y: -1,
            width: 1,
            height: 1
        });

        assert.ok(!r.isInside(-0.5, 0));
    });

    test('Rectangle intersection: intersecting rectangles', function() {
        const r1 = new Rectangle({
                x: -1,
                y: -1,
                width: 2,
                height: 2
            }),
            r2 = new Rectangle({
                x: 0,
                y: 0,
                width: 2,
                height: 2
            });

        assert.ok(r1.intersect(r2));
    });

    test('Rectangle intersection: disjoint rectangles', function() {
        const r1 = new Rectangle({
                x: -1,
                y: -1,
                width: 2,
                height: 2
            }),
            r2 = new Rectangle({
                x: 0,
                y: 2,
                width: 2,
                height: 2
            });

        assert.ok(!r1.intersect(r2));
    });

    test('Cloning', function() {
        const r1 = new Rectangle({
                x: -1,
                y: -1,
                width: 2,
                height: 2
            }),
            r2 = r1.clone();

        assert.strictEqual(r1.getX(), r2.getX());
        assert.strictEqual(r1.getY(), r2.getY());
        assert.strictEqual(r1.getWidth(), r2.getWidth());
        assert.strictEqual(r1.getHeight(), r2.getHeight());
    });

});
