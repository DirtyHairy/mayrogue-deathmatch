import types from './types';
import Entity from '../entity/Entity';

export default class AddEntity {

    constructor({entity = null} = {}) {
        this._entity = entity;
    }

    get type() {
        return types.ADD_ENTITY;
    }

    getEntity() {
        return this._entity;
    }

    apply(world) {
        if (!world.getEntityById(this._entity.getId())) {
            world.addEntity(this._entity);
        }
    }

    serialize() {
        return this._entity.serialize()
    }

    static unserialize(blob) {
        return new AddEntity(Entity.unserialize(blob.entity));
    }

    destroy() {}

}
