import BrainStem from './BrainStem';
import RandomWalkStrategy from './strategy/RandomWalk';
import HuntStrategy from './strategy/Hunt';
import strategyTypes from './strategy/types';

export default class ZombieBrain extends BrainStem {

    constructor(rng, {walkPropability = 0.3, trackDistance = 5} = {}) {
        super(rng);

        this._walkPropability = walkPropability;
        this._trackDistance = trackDistance;
    }

    setEntity(entity) {
        super.setEntity(entity);

        entity.attachListeners({
            attacked: this._onAttack
        }, this);

        this._addStrategy(new RandomWalkStrategy(entity, this._rng, {
            walkPropability: this._walkPropability
        }));
        this._addStrategy(new HuntStrategy(entity, this._rng));

        this._strategy = strategyTypes.RANDOM_WALK;
    }

    detach() {
        this._entity.removeListeners({
            attacked: this._onAttack
        }, this);

        super.detach();
    }

    _onAttack(attacker) {
        this._setStrategy(strategyTypes.HUNT).setTarget(attacker);
    }

    tick() {
        let strategy = this._getStrategy();

        strategy.tick();

        if (!strategy.canDecide()) {
            this._setStrategy(strategyTypes.RANDOM_WALK);
            return;
        }

        return strategy.decide();
    }

}
