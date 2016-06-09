export default class BrainStem {

    constructor(rng) {
        this._rng = rng;
        this._strategies = {};
        this._strategy = null;
        this._entity = null;
    }

    tick() {}

    setEntity(entity) {
        this._entity = entity;
    }

    decide() {
        const strategy = this._getStrategy();

        return strategy && strategy.decide();
    }

    detach() {
        this._entity = null;
    }

    _getStrategy() {
        return this._strategy && this._strategies[this._strategy];
    }

    _setStrategy(strategy) {
        this._strategy = strategy;
        return this._getStrategy();
    }

    _addStrategy(strategy) {
        this._strategies[strategy.type] = strategy;
    }

}
