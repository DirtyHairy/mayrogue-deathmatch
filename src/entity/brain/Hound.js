import BrainStem from './BrainStem';
import RandomWalkStrategy from './strategy/RandomWalk';
import HuntStrategy from './strategy/Hunt';
import strategyTypes from './strategy/types';
import Rectangle from '../../geometry/Rectangle';

export default class HoundBrain extends BrainStem {

    constructor(rng, {attackProbability = 0.8, walkPropability = 0.3, trackDistance = 6, sightDistance = 5} = {}) {
        super(rng);

        this._walkPropability = walkPropability;
        this._trackDistance = trackDistance;
        this._sightDistance = sightDistance;
        this._attackProbability = attackProbability;
    }

    setEntity(entity) {
        super.setEntity(entity);

        entity.attachListeners({
            attacked: this._onAttack
        }, this);

        this._addStrategy(new RandomWalkStrategy(entity, this._rng, {walkPropability: this._walkPropability}));
        this._addStrategy(new HuntStrategy(entity, this._rng, {
            attackProbability: this._attackProbability,
            trackProbability: this._trackProbability,
            trackDistance: this._trackDistance
        }));

        this._strategy = strategyTypes.RANDOM_WALK;
    }

    detach() {
        this._entity.removeListeners({
            attacked: this._onAttack
        }, this);
    }

    _onAttack(attacker) {
        this._setStrategy(strategyTypes.HUNT).setTarget(attacker);
    }

    tick() {

        const currentStrategy = this._getStrategy();
        currentStrategy.tick();

        switch (currentStrategy.type) {

            case strategyTypes.HUNT:

                if (!currentStrategy.canDecide()) {
                    this._setStrategy(strategyTypes.RANDOM_WALK);
                    return;
                }

                return currentStrategy.decide();

            case strategyTypes.RANDOM_WALK:

                const enemy = this._findPossibleEnemy();

                if (enemy) {
                    this._setStrategy(strategyTypes.HUNT).setTarget(enemy);
                    return;
                }

                return currentStrategy.decide();
        }

    }

    _findPossibleEnemy() {
        const sightRect = new Rectangle({
                width:  2 * this._sightDistance,
                height: 2 * this._sightDistance,
                x: this._entity.getX() - this._sightDistance,
                y: this._entity.getY() - this._sightDistance
            });

        const possibleVictims = this._entity
            .getWorld()
            .entitiesIntersectingWith(sightRect)
            .filter(e => e !== this._entity);

        return possibleVictims[Math.floor(this._rng() * possibleVictims.length)];
    }

}
