import Observable from '../util/Observable';
import * as _ from 'lodash';
import actionTypes from '../action/types';

export default class EntityManager extends Observable {

    constructor() {
        super();

        this._entities = [];
        this._entityMap = {};
        this._world = null;

        this.attachListeners({action: this._onEntityAction}, this);
    }

    setWorld(world) {
        this._world = world;
    }

    getEntities() {
        return this._entities;
    }

    _onEntityAction(action, entity) {
        if (!action.validate()) {
            return;
        }

        switch (action.type) {
            case actionTypes.ATTACK:
                if (this._world) {
                    this._world.executeAttack(entity);
                }
                break;
            case actionTypes.MOVE:
                entity.move(action.getDeltaX(), action.getDeltaY());
                break;
            default:
                break;
        }
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
        if (!entity) {
            return true;
        }

        return !_.some(this._entities, e => e !== entity && e.getBoundingBox().intersect(rect));
    }

    fieldAccessible(x, y, entity) {
        if (!entity) {
            return true;
        }

        return !_.some(this._entities, e => e !== entity && e.getBoundingBox().isInside(x, y));
    }

    entitiesIntersectingWith(rect) {
        return this._entities.filter(e => rect.intersect(e.getBoundingBox()));
    }

    doEntitiesIntersectWith(rect) {
        return this.entitiesIntersectingWith(rect).length !== 0;
    }
}
