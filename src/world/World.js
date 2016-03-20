import EntityManager from '../Entity/Manager';
import Observable from '../util/Observable';

export default class World extends Observable {

    constructor({map, entityManager, entities} = {}) {
        this._map = map;
        this._entityManager = entityManager;
        this._dirty = false;
        this._batchInProgress = false;

        if (!this._entityManager) {
            this._entityManager = new EntityManager();
        }

        this._entityManager.attachListeners({
            move: this._onEntityMove,
            statsChange: this._onEntityStatsChange,
            action: this._onEntityAction,
            entityAdded: this._onEntityAdded,
            entityRemoved: this._onEntityRemoved
        }, this);

        if (entities) {
            entities.forEach(entity => this.addEntity(entity));
        }
    }

    getMap() {
        return this._map;
    }

    getEntityManager() {
        return this._entityManager;
    }

    addEntity(entity) {
        this._entityManager.addEntity(entity);
        entity.setWorld(this);

        this.fireEvent('change');
    }

    removeEntity(entity) {
        entity.setWorld(null);
        this._entityManager.removeEntity(entity);

        this.fireEvent('change');
    }

    _onEntityMove() {
        this.fireEvent('change');
    }

    _onEntityStatsChange() {
        this.fireEvent('change');
    }

    _onEntityAction() {}

    _onEntityAdded() {}

    _onEntityRemoved() {}

    getMapData() {
        return this._map.getData();
    }

    rectAccessible(rect, entity) {
        return this._map.rectAccessible(rect) && this._entityManager.rectAccessible(rect, entity);
    }

    fieldAccessible(x, y, entity) {
        return this._map.fieldAccessible(x, y) && this._entityManager.fieldAccessible(x, y, entity);
    }

    entitiesIntersectingWith(rect) {
        return this._entityManager.entitiesIntersectingWith(rect);
    }

    getEntityById(id) {
        return this._entityManager.getEntityById(id);
    }

    getEntities() {
        return this._entityManager.getEntities();
    }

    destroy() {
        super.destroy();
        this._entityManager.destroy();
    }

}
