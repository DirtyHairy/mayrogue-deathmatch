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

    _onEntityMove() {
        this.fireEvent('change');
    }

    _onEntityStatsChange() {
        this.fireEvent('change');
    }

    _onEntityAdded() {}

    _onEntityRemoved() {}

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

    /**
     * TODO: should be moved to dedicated combat managment class
     *
     * @param attacker
     */
    executeAttack(attacker)
    {
        const rect = attacker.getAttackTarget();

        const possibleEnemies = this._entityManager.entitiesIntersectingWith(rect);
        for (let entity of possibleEnemies) {
            let hp = entity.getStats().getHp() - 1;

            entity.attacked(attacker);

            if (hp <= 0) {
                this.respawn(entity);
                this.experience(attacker, entity);
            } else {
                entity.getStats().setHp(hp);
            }
        }
    }

    experience(winner, looser) {
        if (winner.getRole() === Entity.PLAYER) {
            let receivedExp = this._getReceivedExp(winner, looser),
                exp = winner.getStats().getExp() + receivedExp,
                neededExp = winner.getStats().getNeededExp();

            if (exp >= neededExp) {
                winner.getStats().setLevel(winner.getStats().getLevel() + 1);
            }
            winner.getStats().setExp(exp);
        }
    }

    respawn(entity) {
        this._warpEntity(entity);
        entity.getStats().setHp(entity.getStats().getMaxHp());
    }

    /**
     * TODO: should be moved to dedicated combat managment class
     *
     * @param attacker
     * @param entity
     * @returns {number}
     * @private
     */
    _getReceivedExp(attacker, entity) {
        let multiplier = entity.getRole() === Entity.PLAYER ? 1.5 : 1,
            basicExp = entity.getRole() === Entity.PLAYER ? 10 : 5,
            entityLevel = entity.getStats().getLevel() || 1,
            attackerLevel = attacker.getStats().getLevel() || 1;

        return Math.ceil(
            multiplier * basicExp * entityLevel / 5 *
            Math.pow(2 * entityLevel + 10, 2.5) /
            Math.pow(entityLevel + attackerLevel + 10, 2.5) + 1
        );
    }

    _warpEntity(entity, maxTries) {
        let boundingBox = entity.getBoundingBox(),
            placement = this.getFreeRandomRect(boundingBox.getWidth(), boundingBox.getHeight(), maxTries);
        if (placement) {
            entity.setXY(placement.getX(), placement.getY());
        }
    }
}
