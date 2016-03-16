import Observable from '../util/Observable';

export default class Stats extends Observable {

    constructor({
        hp = 0, maxHp = 0, name = '', exp = 0, level = 1
    } = {}) {
        super();

        this._hp = hp;
        this._maxHp = maxHp;
        this._name = name;
        this._exp = exp;
        this._level = level;
    }

    getHp() {
        return this._hp;
    }

    setHp(hp) {
        if (hp !== this._hp) {
            this._hp = hp;
            this.fireEvent('change');
        }

        return this;
    }

    getMaxHp() {
        return this._maxHp;
    }

    setMaxHp(maxHp) {
        if (this._maxHp !== maxHp) {
            this._maxHp = maxHp;
            this.fireEvent('change');
        }

        return this;
    }

    getName() {
        return this._name;
    }

    setName(name) {
        if (name !== this._name) {
            this._name = name;
            this.fireEvent('change');
        }

        return this;
    }

    getExp() {
        return this._exp;
    }

    setExp(exp) {
        if (this._exp !== exp) {
            this._exp = exp;
            this.fireEvent('change');
        }

        return this;
    }

    getLevel() {
        return this._level;
    }

    setLevel(level) {
        if (this._level !== level) {
            this._level = level;
            this.fireEvent('change');
        }

        return this;
    }

    getNeededExp() {
        return Math.floor(4 * Math.pow((this._level() || 1) + 1, 3) / 5);
    }

    heal(healed) {
        this.setHp(Math.min(this._hp + healed, this._maxHp));

        return this;
    }

    serialize() {
        return {
            hp: this._hp,
            maxHp: this._maxHp,
            name: this._name,
            exp: this._exp,
            level: this._level
        };
    }

    static unserialize(blob) {
        return new Stats(blob);
    }
    
}
