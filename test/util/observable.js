/* global suite, test, setup */

import Observable from '../../src/util/Observable';
import * as assert from 'assert';

class Observer {

    constructor() {
        this.flag = false;
        this.event1Fired = 0;
        this.event2Fired = 0;
        this.relayFired = 0;

        this.event1Payload = null;
        this.event2Payload = null;
        this.relayPayload = null;
    }

    attach(observable) {
        observable.attachListeners({
            event1: this._onEvent1,
            event2: this._onEvent2
        }, this);

        observable.attachRelay(this._relay, this);
    }

    detach(observable) {
        observable.detachListeners({
            event1: this._onEvent1,
        }, this);
    }

    _onEvent1(...args) {
        this.flag = true;
        this.event1Fired++;
        this.event1Payload = args;
    }

    _onEvent2(...args) {
        this.flag = true;
        this.event2Fired++;
        this.event2Payload = args;
    }

    _relay(...args) {
        this.relayFired++;
        this.relayPayload = args;
    }

}

suite('Observable', function() {

    let observable, observer;

    setup(function() {
        observable = new Observable();
        observer = new Observer();

        observer.attach(observable);
    });

    test('events can be bound', function() {
        observable.fireEvent('event1');
        observable.fireEvent('event2');

        assert.ok(observer.event1Fired > 0, 'event1 should have fired');
        assert.ok(observer.event2Fired > 0 , 'event2 should have fired');
    });

    test('arguments are propagated, observable is appended', function() {
        observable.fireEvent('event1', 1, 2, 3);

        assert.deepEqual(observer.event1Payload, [1, 2, 3, observable]);
    });

    test('handlers can be detached', function() {
        observer.detach(observable);

        observable.fireEvent('event1');
        observable.fireEvent('event2');

        assert.ok(observer.event1Fired === 0, 'event1 fired');
        assert.ok(observer.event2Fired > 0, 'event2 should have fired');
    });

    test('handlers can be detached by scope', function() {
        observable.detachAllListeners(observer);

        observable.fireEvent('event1');
        observable.fireEvent('event2');

        assert.ok(observer.event1Fired === 0, 'event1 fired');
        assert.ok(observer.event2Fired === 0, 'event2 fired');
    });

    test('handlers can be attached multiple times', function() {
        observer.attach(observable);

        observable.fireEvent('event1');

        assert.strictEqual(observer.event1Fired, 2, 'should have fired twice');
    });

    test('detaching removes all copies of multiply registered handlers', function() {
        observer.attach(observable);
        observer.detach(observable);

        observable.fireEvent('event1');
        observable.fireEvent('event2');

        assert.strictEqual(observer.event1Fired, 0, 'event1 should not have fired');
        assert.strictEqual(observer.event2Fired, 2, 'event2 should have fired twice');
    });

    test('events are forwarded to relays', function() {
        assert.ok(!observer.relayFired);

        observable.fireEvent('event1', 1, 2);

        assert.ok(observer.relayFired, 'relay did not fire');
        assert.deepEqual(observer.relayPayload, ['event1', 1, 2, observable], 'payload differs');

        observable.fireEvent('event2', 45, false);
        assert.deepEqual(observer.relayPayload, ['event2', 45, false, observable], 'payload differs');
    });

    test('relays can be detached individually', function() {
        observable.detachRelay(observer._relay, observer);

        observable.fireEvent('event1');
        assert.ok(!observer.relayFired, 'relay should not have fired');
    });

    test('relays can be detached by scope', function() {
        observable.detachAllRelays(observer);

        observable.fireEvent('event1');
        assert.ok(!observer.relayFired, 'relay should not have fired');
    });

    test('all relays and event handlers can be detached simultaneously', function() {
        observable.detachAll(observer);

        observable.fireEvent('event1');

        assert.ok(!observer.event1Fired, 'event1 should not have fired');
        assert.ok(!observer.event2Fired, 'event2 should not have fired');
        assert.ok(!observer.relayFired, 'relay should not have fired');
    });

});
