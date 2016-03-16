import types from './types';

export default class Stats {

    constructor({hp, exp, level, id} = {}) {
        this._hp = hp;
        this._exp = exp;
        this._level = level;
        this._id = id;

        this.type = types.STATS;
    }

    getHp() {
        return this._hp;
    }

    setHp(hp) {
        this._hp = hp;
        return this;
    }

    getExp() {
        return this._exp;
    }

    setExp(exp) {
        this._exp = exp;
        return this;
    }

    getLevel() {
        return this._level;
    }

    setLevel(level) {
        this._level = level;
        return this;
    }

    getId() {
        return this._id;
    }

    setId(id) {
        this._id = id;
        return this;
    }

    apply(world) {
        const entity = world.getEntityById(this._id);

        if (entity) {
            entity.getStats().setHp(this._hp);
            entity.getStats().setExp(this._exp);
            entity.getStats().setLevel(this._level);
        }
    }

    serialize() {
        return {
            hp: this._hp,
            exp: this._exp,
            level: this._level,
            id: this._id
        };
    }

    static unserialize(blob) {
        return new Stats(blob);
    }

}
