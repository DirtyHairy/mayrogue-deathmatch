import types from './types';
import Entity from '../Entity';

export default class AddEntity {

    constructor({entity = null} = {}) {
        this._entity = entity;
        this.type = types.ADD_ENTITY;
    }

    apply(world) {
        if (!world.getEntityById(this._entity.getId())) {
            world.addEntity(this._entity);    
        }
    }

    serialize() {
        return {
            entity: this._entity.serialize()
        };
    }

    static unserialize(blob) {
        return new AddEntity(Entity.unserialize(blob.entity));
    }

    destroy() {}

}
