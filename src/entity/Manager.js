import Observable from '../util/Observable';
import * as _ from 'lodash';

export default class EntityManager extends Observable {

    constructor() {
        this._entities = [];
        this._entityMap = {};
    }

    getEntities() {
        return this._entities;
    }


    addEntity(entity) {
        this._entities.push(entity);
        this._entityMap[entity.getId()] = entity;

        entity.attachRelay((...args) => this.fireEvent(...args), this);

        this.fireEvent('entityAdded', entity);
    }

    removeEntity(entity, doNotDestroy) {
        const id = entity.getId();

        this._entities = this._entities.filter(e => e !== entity);
        delete this._entityMap[id];

        this.fireEvent('entityRemoved', entity);

        if (!doNotDestroy) {
            entity.destroy();
        } else {
            entity.detachAll(this);
        }
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
