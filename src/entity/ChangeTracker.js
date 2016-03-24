import * as _ from 'lodash';
import ChangeMovement from '../change/Movement';
import ChangeStats from '../change/Stats';
import ChangeRemoveEntity from '../change/RemoveEntity';
import ChangeAddEntity from '../change/AddEntity';

export default class ChangeTracker {

    constructor(entityManager) {
        this._entityManager = entityManager;

        this._entityManager.attachListeners({
            entityAdded: this._onEntityAdded,
            entityRemoved: this._onEntityRemoved,
            move: this._onEntityMove,
            statsChange: this._onEntityStatsChange,
        }, this);

        this.clearChanges();
        this._entityManager.getEntities().forEach(entity => this._onEntityAdded(entity));
    }

    clearChanges() {
        this._movements = {};
        this._statsUpdates = {};
        this._newEntities = {};
    }

    _onEntityMove(bbOld, bbNew, entity) {
        // Only record the new position if the entity wasn't added in this this timeslice --- in this case, it will
        // be retransmitted anyway
        const id = entity.getId();
        if (!this._newEntities[id]) {
            this._movements[id] = entity;
        }
    }

    _onEntityStatsChange(entity) {
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

    _onEntityAdded(entity) {
        const id = entity.getId();

        this._newEntities[id] = entity;

        return this;
    }

    _onEntityRemoved(entity) {
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
        this._entityManager.entitiesIntersectingWith(trackingDomain).forEach(
            entity => trackedEntitiesNew[entity.getId()] = entity
        );

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

    destroy() {
        this._entityManager.detachAllListeners(this);
    }
}
