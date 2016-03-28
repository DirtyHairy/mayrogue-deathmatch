/* global suite, test */

import * as generatorFactory from '../../src/random/generatorFactory';
import * as assert from 'assert';

suite('Random number generators', function() {

    suite('Default generator', function() {

        test('Indetically seeded generators return the same values', function() {
            const gen1 = generatorFactory.newDefaultGenerator(1),
                gen2 = generatorFactory.newDefaultGenerator(1);

            for (let i = 0; i < 10; i++) {
                assert.strictEqual(gen1(), gen2());
            }
        });

        test('Different seeds return different series', function() {
            const gen1 = generatorFactory.newDefaultGenerator(1),
                gen2 = generatorFactory.newDefaultGenerator(2);

            for (let i = 0; i < 10; i++) {
                assert.ok(gen1() !== gen2());
            }
        });

    });

});
