/* global suite, test */

import DomainMap from '../../src/map/DomainMap';
import * as assert from 'assert';

suite('Domain Map', function() {

    function countDomains(domains) {
        const visited = {};
        let domainCount = 0;

        for (let i = 0; i < domains.length; i++) {
            if (!visited[domains[i]]) {
                visited[domains[i]] = true;
                domainCount++;
            }
        }

        return domainCount;
    }

    function runTest(doors, expectedDomains) {
        const door = i => doors[i] ? "X" : "-",
            DOOR_0 = [0, 7],
            DOOR_1 = [7, 2],
            DOOR_2 = [10, 7],
            DOOR_3 = [7, 8];

        test(`Domain assignment, testcase with doors: ${door(0)}${door(1)}${door(2)}${door(3)}`, function() {
            const map = new Array(15*15),
                idx = (x, y) => y*15 + x;

            Array.fill(map, true);

            for (let i = 0; i < 15; i++) {
                map[idx(i, 7)] = map[idx(7, i)] = false;
            }

            map[idx(...DOOR_0)] = doors[0];
            map[idx(...DOOR_1)] = doors[1];
            map[idx(...DOOR_2)] = doors[2];
            map[idx(...DOOR_3)] = doors[3];

            const domainMap = new DomainMap(15, 15, (x, y) => map[idx(x, y)]),
                domains = domainMap.getDomains();

            assert.strictEqual(countDomains(expectedDomains), domains.length,
                `domain count mismatch: expected ${countDomains(expectedDomains)}, got ${domains.length}`);

            const mappings = {},
                assertDomain = (x, y, i, sector) => {
                    if (!map[idx(x, y)]) {
                        return;
                    }

                    const domain = domainMap.getDomain(x, y);

                    if (mappings.hasOwnProperty(domain)) {
                        assert.strictEqual(mappings[domain], expectedDomains[i],
                            `wrong domain in sector ${sector}, ${x}, ${y}: expected ${expectedDomains[i]}, got ${mappings[domain]}`
                        );
                    } else {
                        mappings[domain] = expectedDomains[i];
                    }
                };

            for (let x = 0; x < 7; x++) {
                for (let y = 0; y < 7; y++) {
                    assertDomain(x, y, 0, 'NW');
                }
            }
            assertDomain(...DOOR_0, 0, 'NW');

            for (let x = 8; x < 15; x++) {
                for (let y = 0; y < 7; y++) {
                    assertDomain(x, y, 1, 'NE');
                }
            }
            assertDomain(...DOOR_1, 1, 'NE');

            for (let x = 8; x < 15; x++) {
                for (let y = 8; y < 15; y++) {
                    assertDomain(x, y, 2, 'SE');
                }
            }
            assertDomain(...DOOR_2, 2, 'SE');

            for (let x = 0; x < 7; x++) {
                for (let y = 8; y < 15; y++) {
                    assertDomain(x, y, 3, 'SW');
                }
            }
            assertDomain(...DOOR_3, 3, 'SW');

        });
    }

    runTest([0, 0, 0, 0], [1, 2, 3, 4]);

    runTest([1, 0, 0, 0], [1, 2, 3, 1]);
    runTest([0, 1, 0, 0], [1, 1, 2, 3]);
    runTest([0, 0, 1, 0], [1, 2, 2, 3]);
    runTest([0, 0, 0, 1], [1, 2, 3, 3]);

    runTest([1, 1, 0, 0], [1, 1, 2, 1]);
    runTest([1, 0, 1, 0], [1, 2, 2, 1]);
    runTest([1, 0, 0, 1], [1, 2, 1, 1]);
    runTest([0, 1, 1, 0], [1, 1, 1, 2]);
    runTest([0, 1, 0, 1], [1, 1, 2, 2]);
    runTest([0, 0, 1, 1], [1, 2, 2, 2]);

    runTest([0, 1, 1, 1], [1, 1, 1, 1]);
    runTest([1, 0, 1 ,1], [1, 1, 1, 1]);
    runTest([1, 1, 0, 1], [1, 1, 1, 1]);
    runTest([1, 1, 1, 0], [1, 1, 1, 1]);

    runTest([1, 1, 1, 1], [1, 1, 1, 1]);
});
