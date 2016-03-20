import Observable from '../util/Observable';
import * as _ from 'lodash';

export default class EntityManager extends Observable {

    constructor() {
        super();

        this._entities = [];
        this._entityMap = {};
    }

    getEntities() {
        return this._entities;
    }


    addEntity(entity) {
        if (this.getEntityById(entity.getId())) {
            return this;
        }

        this._entities.push(entity);
        this._entityMap[entity.getId()] = entity;

        entity.attachRelay((...args) => this.fireEvent(...args), this);

        this.fireEvent('entityAdded', entity);

        return this;
    }

    removeEntity(entity, doNotDestroy) {
        const id = entity.getId();

        if (!this.getEntityById(id)) {
            return;
        }

        this._entities = this._entities.filter(e => e !== entity);
        delete this._entityMap[id];

        this.fireEvent('entityRemoved', entity);

        if (!doNotDestroy) {
            entity.destroy();
        } else {
            entity.detachAll(this);
        }

        return this;
    }

    getEntityById(id) {
        return this._entityMap[id] || null;
    }

    rectAccessible(rect, entity) {
        if (!entity) return true;

        return !_.some(this._entities, e => e !== entity && e.getBoundingBox().intersect(rect));
    }

    fieldAccessible(x, y, entity) {
        if (!entity) return true;

        return !_.some(this._entities, e => e !== entity && e.getBoundingBox().isInside(x, y));
    }

    entitiesIntersectingWith(rect) {
        return this._entities.filter(e => rect.intersect(e.getBoundingBox()));
    }

}
