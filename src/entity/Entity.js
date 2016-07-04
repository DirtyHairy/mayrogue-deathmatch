import Observable from '../util/Observable';
import tiles from '../tiles';
import Rectangle from '../geometry/Rectangle';
import Stats from '../stats/Stats';
import DeadBrain from './brain/DeadBrain';

export default class Entity extends Observable {

    constructor({
        shape = 0, role = 0, heading = 'east', id = 0, map = null, x = 0, y = 0, stats = null, healingRate = 15
    } = {}) {
        super();

        this._shape = shape;
        this._role = role;
        this._heading = heading;
        this._id = id;
        this._map = map;
        this._brain = new DeadBrain();
        this._brain.setEntity(this);
        this._healingRate = healingRate;
        this._healingCounter = 0;

        this._boundingBox = new Rectangle({
            x: x,
            y: y,
            width: tiles.properties[this._shape].width,
            height: tiles.properties[this._shape].height
        });

        this._stats = stats || new Stats();
        this._stats.attachListeners({
            change: this._onStatsChange
        }, this);

        this._world = null;
    }

    getHeading() {
        return this._heading;
    }

    setHeading(heading) {
        if (this._heading !== heading) {
            this._heading = heading;
            this.fireEvent('change');
        }

        return this;
    }

    getShape() {
        return this._shape;
    }

    getRole() {
        return this._role;
    }

    getId() {
        return this._id;
    }

    getMap() {
        return this._map;
    }

    getBoundingBox() {
        return this._boundingBox;
    }

    getStats() {
        return this._stats;
    }

    getWorld() {
        return this._world;
    }

    setWorld(world) {
        this._world = world;
        return this;
    }

    getX() {
        return this._boundingBox.getX();
    }

    getY() {
        return this._boundingBox.getY();
    }

    setX(x, force) {
        this._changePosition(x, this._boundingBox.getY(), force);
        return this;
    }

    setY(y, force) {
        this._changePosition(this._boundingBox.getX(), y, force);
        return this;
    }

    setXY(x, y, force) {
        this._changePosition(x, y, force);
        return this;
    }

    attacked(attacker) {
        this.fireEvent('attacked', attacker);
    }

    getAttackTarget() {
        const attackRect = new Rectangle({
            x: this.getX(),
            y: this.getY(),
            height: 1,
            width: 1
        });

        switch (this._heading) {
            case 'north':
                attackRect.setY(attackRect.getY() - 1);
                attackRect.setWidth(this._boundingBox.getWidth());
                break;
            case 'south':
                attackRect.setY(attackRect.getY() + 1 + this._boundingBox.getHeight() - 1);
                attackRect.setWidth(this._boundingBox.getWidth());
                break;
            case 'east':
                attackRect.setX(attackRect.getX() + 1 + this._boundingBox.getWidth() - 1);
                attackRect.setHeight(this._boundingBox.getHeight());
                break;
            case 'west':
                attackRect.setX(attackRect.getX() - 1);
                attackRect.setHeight(this._boundingBox.getHeight());
                break;
        }

        return attackRect;
    }

    serialize() {
        return {
            x: this.getX(),
            y: this.getY(),
            shape: this._shape,
            id: this._id,
            stats: this._stats.serialize(),
            heading: this._heading,
            role: this._role,
        };
    }

    replaceBrain(newBrain) {
        this._brain.detach();
        this._brain = newBrain;
        this._brain.setEntity(this);
    }

    static unserialize(blob) {
        const stats = Stats.unserialize(blob.stats);
        blob.stats = stats;
        return new Entity(blob);
    }

    _onStatsChange() {
        this.fireEvent('statsChange', this);
    }

    _changePosition(x, y, force) {
        const boundingBoxNew = new Rectangle({
                x: x,
                y: y,
                height: this._boundingBox.getHeight(),
                width: this._boundingBox.getWidth()
            }),
            boundingBoxOld = this._boundingBox;

        this._setHeadingAfterMovement(boundingBoxOld, boundingBoxNew);

        if (force || !this._world || this._world.rectAccessible(boundingBoxNew, this))
        {
            this._boundingBox = boundingBoxNew;
            this.fireEvent('move', boundingBoxOld, boundingBoxNew);
        } else {
            this.fireEvent('move', boundingBoxOld, boundingBoxOld);
        }
    }

    _setHeadingAfterMovement(boundingBoxOld, boundingBoxNew) {
        if (boundingBoxOld.getX() > boundingBoxNew.getX()) {
            this.setHeading("west");
        } else if (boundingBoxOld.getX() < boundingBoxNew.getX()) {
            this.setHeading("east");
        } else if (boundingBoxOld.getY() > boundingBoxNew.getY()) {
            this.setHeading("north");
        } else if (boundingBoxOld.getY() < boundingBoxNew.getY()) {
            this.setHeading("south");
        }
    }

    move(deltaX, deltaY) {
        const bb = this.getBoundingBox();
        this.setXY(bb.getX() + deltaX, bb.getY() + deltaY);
    }

    tick() {
        if (this._brain) {
            let action = this._brain.tick();
            if (action) {
                this.fireEvent('action', action);
            }
        }

        if (this._healingCounter >= this._healingRate) {
            this._healingCounter = 0;
            this._stats.heal(1);
        } else {
            this._healingCounter++;
        }
    }
}

Object.defineProperties(Entity, {
    NPC: {
        value: 0,
        enumerable: true
    },
    PLAYER: {
        value: 1,
        enumerable: true
    }
});
