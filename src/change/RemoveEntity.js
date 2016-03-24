import types from './types';

export default class RemoveEntity {

    constructor({entity, id} = {}) {
        this._id = entity ? entity.getId() : id;
    }

    get type() {
        return types.REMOVE_ENTITY;
    }

    getId() {
        return this._id;
    }

    setId(id) {
        this._id = id;
        return this;
    }

    apply(world) {
        world.removeEntity(world.getEntityById(this._id));
    }

    serialize() {
        return {
            id: this._id
        };
    }

    static unserialize(blob) {
        return new RemoveEntity(blob);
    }

    destroy() {}

}
