/* global suite, test */

import RandomMapFactory from '../../src/map/RandomMapFactory';
import Map from '../../src/map/Map';
import * as assert from 'assert';
import {newDefaultGenerator} from '../../src/random/generatorFactory';
import DomainMap from '../../src/map/DomainMap';

suite('RandomMapFactory', () => {

    function getDomains(map) {
        const domainMap = new DomainMap(
            map.getWidth(),
            map.getHeight(),
            (x, y) => map.fieldAccessible(x, y)
        );

        return domainMap.getDomains();
    }

/* For debug purposes. Fuck off. Really.
    function renderMap(map) {
        let out = "";
        for (let x = 0; x < map.getWidth(); x++) {
            out = "";
            for (let y = 0; y < map.getHeight(); y++) {
                out += map.fieldAccessible(x, y) ? '.' : 'X';
            }
            console.log(out);
        }
    }
*/

    test('Returns a map', () => {
        const factory = new RandomMapFactory(10, 10, newDefaultGenerator(1));
        const map = factory.create();

        assert.ok(map instanceof Map);

        assert.ok(map.getWidth() === 10);
        assert.ok(map.getHeight() === 10);
    });

    test('Two maps are the same', () => {
        const factory1 = new RandomMapFactory(10, 10, newDefaultGenerator(1));
        const map1 = factory1.create();

        const factory2 = new RandomMapFactory(10, 10, newDefaultGenerator(1));
        const map2 = factory2.create();

        assert.deepEqual(map1._data, map2._data);
    });

    function testMapHasOnlyOneDomain(i) {
        let factory, map, domains;

        factory = new RandomMapFactory(i * 5, i * 5, newDefaultGenerator(i));
        map = factory.create();
        domains = getDomains(map);
        assert.equal(domains.length, 1);
    }

    for (let i = 5; i <= 10; i++) {
        test('Map has only one domain', testMapHasOnlyOneDomain.bind(null, i));
    }

});
