import EntityManager from '../entity/Manager';
import Observable from '../util/Observable';
import Entity from '../entity/Entity';
import Rectangle from '../geometry/Rectangle';
import {newDefaultGenerator} from '../random/generatorFactory';
import ChangeTracker from '../entity/ChangeTracker';

export default class World extends Observable {

    constructor({map, entityManager, entities} = {}) {
        super();

        this._map = map;
        this._entityManager = entityManager;
        this._dirty = false;
        this._batchInProgress = false;
        this._nextId = 1;

        if (!this._entityManager) {
            this._entityManager = new EntityManager();
        }

        this._changeTracker = new ChangeTracker(this._entityManager);

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

    addNewRandomEntity(config) {

        config.id = this._nextId++;
        const entity = new Entity(config);

        let boundingBox = entity.getBoundingBox();
        let placement = this.getFreeRandomRect(boundingBox.getWidth(), boundingBox.getHeight());

        if (placement) {
            entity.setXY(placement.getX(), placement.getY());
            this.addEntity(entity);
        }

        return entity;
    }

    clearChanges() {
        this._changeTracker.clearChanges();
    }

    pickupChangeset(playerContext) {
        this._changeTracker.pickupChangeset(playerContext);
    }

    /**
     * Find a free random rect. After maxTries (default 50) of finding a true random position, we systematically
     * walk through the map (starting from a new random position) until we find a free tile. If the is no free tile,
     * we return null.
     *
     * @param width
     * @param height
     * @param maxTries
     * @returns {Geometry.Rectangle}
     */
    getFreeRandomRect(width, height, maxTries) {
        let thisTry = 0,
            accessible = false,
            rect = new Rectangle({
                width: width,
                height: height
            });

        let mapWidth = this._map.getWidth(),
            mapHeight = this._map.getHeight();

        if (!maxTries) {
            maxTries = 50;
        }

        const rng = newDefaultGenerator();

        do {
            rect.setX(Math.floor(rng() * (mapWidth - width)));
            rect.setY(Math.floor(rng() * (mapHeight - height)));
        } while (!(accessible = this.rectAccessible(rect)) && thisTry++ < maxTries);

        if (accessible) {
            return rect;
        }

        let x = Math.floor(rng() * (mapWidth - width)),
            y = Math.floor(rng() * (mapHeight - height)),
            i = 0;
        do {
            rect.setX(x).setY(y);
            if (++x >= mapWidth) {
                x = 0;
                if (++y >= mapHeight) {
                    y = 0;
                }
            }
            i++;
        } while (!(accessible = this.rectAccessible(rect))  && i < mapWidth * mapHeight);

        return accessible ? rect : null;
    }
}
