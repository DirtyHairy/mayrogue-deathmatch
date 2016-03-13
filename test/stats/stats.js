/* global suite, test */

import Stats from '../../src/stats/Stats';
import * as assert from 'assert';

suite('Stats', function() {

    function testMutation(name, setter, getter, value) {
        test(`Mutating ${name} should fire 'change'`, function() {
            const s = new Stats();
            let events = 0;

            s.attachListeners({
                change: () => events++
            }, null);

            s[setter](value);
            s[setter](value);

            assert.strictEqual(events, 1);
            assert.strictEqual(s[getter](), value);
        });
    }

    testMutation('hp', 'setHp', 'getHp', 10);
    testMutation('maxHp', 'setMaxHp', 'getMaxHp', 11);
    testMutation('name', 'setName', 'getName', 'foo');
    testMutation('exp', 'setExp', 'getExp', 12);
    testMutation('level', 'setLevel', 'getLevel', 13);

    test('healing', function() {
        const s = new Stats({hp:5, maxHp: 10});

        s.heal(3);
        assert.strictEqual(s.getHp(), 8);

        s.heal(3);
        assert.strictEqual(s.getHp(), 10);
    });

    test('(de)serialization', function() {
        const s1 = new Stats({
                hp: 10,
                maxHp: 11,
                name: 'John Doe',
                exp: 233,
                level: 2
            }),
            s2 = Stats.unserialize(s1.serialize());

            assert.strictEqual(s1.getHp(), s2.getHp());
            assert.strictEqual(s1.getMaxHp(), s2.getMaxHp());
            assert.strictEqual(s1.getName(), s2.getName());
            assert.strictEqual(s1.getExp(), s2.getExp());
            assert.strictEqual(s1.getLevel(), s2.getLevel());
    });

});
