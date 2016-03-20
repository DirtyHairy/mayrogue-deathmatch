import * as _ from 'lodash';
import EntityManagerBase from '../../entity/Manager';
import ChangeMovement from '../../change/Movement';
import ChangeStats from '../../change/Stats';
import ChangeRemoveEntity from '../../change/RemoveEntity';
import ChangeAddEntity from '../../change/AddEntity';

export default class EntityManager extends EntityManagerBase {

    constructor(config) {
        super(config);

        this._movements = null;
        this._statsUpdates = null;
        this._newEntities = null;

        this.clearChanges();
    }

    clearChanges() {
        this._movements = {};
        this._statsUpdates = {};
        this._newEntities = {};
    }

    _onEntityMove(bbOld, bbNew, entity) {
        super._onEntityMove(...arguments);

        // Only record the new position if the entity wasn't added in this this timeslice --- in this case, it will
        // be retransmitted anyway
        const id = entity.getId();
        if (!this._newEntities[id]) {
            this._movements[id] = entity;
        }
    }

    _onEntityStatsChange(entity) {
        super._onEntityStatsChange(...arguments);

        // See above
        const id = entity.getId();
        if (!this._newEntities[id]) {
            if (!this._statsUpdates[id]) {
                this._statsUpdates[id] = {id: id};
            }
            this._statsUpdates[id].hp = entity.getStats().getHp();
            this._statsUpdates[id].exp = entity.getStats().getExp();
            this._statsUpdates[id].level = entity.getStats().getLevel();
        }
    }

    addEntity(entity) {
        super._addEntity(entity);

        const id = entity.getId();

        if (this.getEntityById(id)) {
            return this;
        }

        this._newEntities[id] = entity;
    }


    removeEntity(entity) {
        super.removeEntity(this);

        // Remove the entity from all changeset registries
        const id = entity.getId();
        [this._movements, this._statsUpdates, this._newEntities].forEach(registry => {
            if (registry[id]) {
                delete registry[id];
            }
        });
    }

    /**
     * Build the changeset for a particular player. The algorithm works by identifying all entities with the
     * current tracking domain and comparing those to the same set from the last timeslice.
     *
     * 1) Entities whose state changes to "not tracked" are removed
     * 2) Entities whose state changes to "tracked" are transmitted
     * 3) Changes for entities which were tracked and are still tracked are transmitted
     * 4) All other entities are ignored.
     *
     * NOTE that the player entity is always in within the tracking domain and thus contained in both sets, so it does not
     * need any special treatment --- changes to the player entity are always transmitted.
     */
    pickupChangeset(playerContext) {
        const trackedEntitiesOld = playerContext.getTrackedEntities();

        // Entities within this domain are tracked
        const trackingDomain = playerContext.getTrackingDomain();

        // Build a list of all entities which are in the tracking domain
        const trackedEntitiesNew = {};
        this.getEntities().forEach(entity => {
            if (trackingDomain.intersect(entity.getBoundingBox())) {
                trackedEntitiesNew[entity.getId()] = entity;
            }
        });

        const changeset = [];

        _.each(trackedEntitiesOld, entity => {
            // We _could_ use the field id here, but then we'd have to typecast!!!
            const id = entity.getId();

            // If we were are still tracking a previously tracked entity, just parrot the changes
            if (trackedEntitiesNew[id]) {

                if (this._movements[id]) {
                    changeset.push(new ChangeMovement({
                        id: id,
                        x: entity.getX(),
                        y: entity.getY(),
                        heading: entity.getHeading()
                    }));
                }

                if (this._statsUpdates[id]) {
                    changeset.push(new ChangeStats(this._statsUpdates[id]));
                }
            } else {

                // The entity is not tracked anymore -> remove it
                changeset.push(new ChangeRemoveEntity({
                    id: id
                }));
            }
        });

        _.each(trackedEntitiesNew, entity => {
            // We _could_ use the field id here, but then we'd have to typecast!!!
            const id = entity.getId();

            // To-be-tracked entities which were not tracked before are transmitted
            if (!trackedEntitiesOld[id]) {
                changeset.push(new ChangeAddEntity({
                    entity: entity
                }));
            }
        });

        // Cycle the tracked entities for the next step
        playerContext.setTrackedEntities(trackedEntitiesNew);

        return changeset;
    }
}
