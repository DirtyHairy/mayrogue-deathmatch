import Rectangle from '../geometry/Rectangle';

export default class PlayerContext {

    constructor({
        connection, entity, trackingDomainScale = 1.2
    } = {}) {
        this._connection = connection;
        this._entity = entity;
        this._trackingDomainScale = trackingDomainScale;
        this._generation = 0;
        this._tick = 0;
        this._trackedEntities = {};

        this._entity.attachListeners({
            tick: this._onTick
        }, this);
    }

    getConnection() {
        return this._connection;
    }

    getEntity() {
        return this._entity;
    }

    getGeneration() {
        return this._generation;
    }

    getTick() {
        return this._tick;
    }

    getTrackedEntities() {
        return this._trackedEntities;
    }

    setTrackedEntities(trackedEntities) {
        this._trackedEntities = trackedEntities;

        return this;
    }

    _onTick() {
        this._tick++;
        if (this._tick % 10 === 0) {
            this._entity.getStats().heal(1);
        }
    }

    /*
     * Determine the domain within which entities are tracked. Currently this is determined by scaling the viewport.
     *
     * TODO: The viewport size is hardcoded BOTH here and in dispatch.js --- bad practice, should eventually become
     * an app-wide parameter
     */
    getTrackingDomain() {
        const positive = x => x > 0 ? x : 0;

        return new Rectangle({
            x: positive(this._entity.getX() - Math.floor(20 * this._trackingDomainScale / 2)),
            y: positive(this._entity.getY() - Math.floor(15 * this._trackingDomainScale / 2)),
            width: Math.ceil(20 * this._trackingDomainScale),
            height: Math.ceil(15 * this._trackingDomainScale)
        });
    }

    destroy() {}

}
