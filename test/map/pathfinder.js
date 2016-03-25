/* global suite, test */

import Pathfinder from '../../src/map/Pathfinder';
import * as assert from 'assert';

suite('A* Pathfinder', function() {

    function neighbours(x0, y0, x1, y1) {
        return (Math.abs(x0 - x1) + Math.abs(y0 - y1)) === 1;
    }

    test('Finds a path between connected points', function() {
        const pathfinder = new Pathfinder(10, 15);

        for (let x = 3; x < 7; x++) {
            for (let y = 3; y < 12; y++) {
                pathfinder.setInaccessible(x, y);
            }
        }

        const path = pathfinder.findPath(0, 0, 9, 14);

        assert.ok(!!path);

        for (let i = 0; i < path.length; i++) {
            if (i > 0) {
                assert.ok(
                    neighbours(path[i].x, path[i].y, path[i-1].x, path[i-1].y),
                    `path nodes ${i}, and ${i-1} are not neighbours`
                );
            }
        }

        const project = ({x, y}) => ({x: x, y: y});

        assert.deepEqual(project(path[0]), {x: 0, y:0});
        assert.deepEqual(project(path[path.length-1]), {x:9, y: 14});
    });

    test('Does not find a path between disconnected points', function() {
        const pathfinder = new Pathfinder(10, 15);

        for (let y = 0; y < 15; y++) {
            pathfinder.setInaccessible(4, y);
        }

        const path = pathfinder.findPath(0, 0, 9, 14);

        assert.ok(Array.isArray(path));
        assert.strictEqual(path.length, 0);
    });

});
