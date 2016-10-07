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

        this._entityManager.setWorld(this);

        this._changeTracker = new ChangeTracker(this._entityManager);

        this._entityManager.attachListeners({
            move: this._onEntityMove,
            statsChange: this._onEntityStatsChange,
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

    getMapData() {
        return this._map.getData();
    }

    findWay(x0, y0, x1, y1) {
        return this._map.findWay(x0, y0, x1, y1);
    }

    rectAccessible(rect, entity) {
        return this._map.rectAccessible(rect) && this._entityManager.rectAccessible(rect, entity);
    }

    fieldAccessible(x, y, entity) {
        return this._map.fieldAccessible(x, y) && this._entityManager.fieldAccessible(x, y, entity);
    }

    rectFreeToPlaceEntity(rect) {
        const mapAccessible = this._map.rectAccessible(rect);
        const entityManagerAccessible = !this._entityManager.doEntitiesIntersectWith(rect);
        return mapAccessible && entityManagerAccessible;
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
        return this._changeTracker.pickupChangeset(playerContext);
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
        } while (!(accessible = this.rectFreeToPlaceEntity(rect)) && thisTry++ < maxTries);

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
        } while (!(accessible = this.rectFreeToPlaceEntity(rect))  && i < mapWidth * mapHeight);

        return accessible ? rect : null;
    }

    _onEntityMove() {
        this.fireEvent('change');
    }

    _onEntityStatsChange() {
        this.fireEvent('change');
    }

    _onEntityAdded() {}

    _onEntityRemoved() {}

}
