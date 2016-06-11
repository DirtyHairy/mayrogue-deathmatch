import types from './types';
import AttackAction from '../../../action/Attack';
import MoveAction from '../../../action/Move';
import Rectangle from '../../../geometry/Rectangle';

export default class Hunt
{

    constructor(entity, rng, {attackProbability = 0.8, trackProbability = 0.5, trackDistance = 5} = {}) {
        this._entity = entity;
        this._rng = rng;
        this._attackProbability = attackProbability;
        this._trackProbability = trackProbability;
        this._trackDistance = trackDistance;
        this._target = null;
        this._path = null;
    }

    tick() {
        this._refreshPath();
    }

    get type() {
        return types.HUNT;
    }

    setTarget(target) {
        this._target = target;
    }

    canDecide() {
        return !!this._path && this._path.length <= this._trackDistance;
    }

    decide() {
        if (!this._target) {
            return null;
        }

        const boundingBox = this._target.getBoundingBox(),
            rangeRect = new Rectangle({
                x: boundingBox.getX() - 1,
                y: boundingBox.getY() - 1,
                width: boundingBox.getWidth() + 2,
                height: boundingBox.getHeight() + 2
            });

        if (this._entity.getAttackTarget().intersect(rangeRect)) {
            return this._randomChoice(this._attackProbability) ? new AttackAction() : null;
        }

        const entityX = this._entity.getX(),
            entityY = this._entity.getY();

        if (!this._path || this._path.length === 0) {
            return null;
        }

        if (this._path[1].x !== entityX) {
            return this._randomChoice(this._trackProbability) ?
                new MoveAction({deltaX: this._path[1].x - entityX}) :
                null;
        }

        if (this._path[1].y !== entityY) {
            return this._randomChoice(this._trackProbability) ?
                new MoveAction({deltaY: this._path[1].y - entityY}) :
                null;
        }
    }

    _refreshPath() {
        this._path = this._entity.getWorld()
            .findWay(
                this._entity.getX(),
                this._entity.getY(),
                this._target.getX(),
                this._target.getY()
            );
    }

    _randomChoice(propability) {
        return propability < 1 ? this._rng() < propability : true;
    }
}
