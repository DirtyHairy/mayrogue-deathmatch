import ExecutorBase from '../../action/Executor';
import Entity from '../../entity/Entity';

export default class Executor extends ExecutorBase {

    _onAttack(action, world, originator) {
        const possibleTargets = world.entitiesIntersectingWith(originator.getAttackTarget());

        for (let target of possibleTargets) {
            let hp = target.getStats().getHp() - 1;

            target.attacked(originator);

            if (hp <= 0) {
                target.getStats().setHp(target.getStats().getMaxHp());

                this._warpEntity(target, world);

                this._experience(originator, target);
            } else {
                target.getStats().setHp(hp);
            }
        }
    }

    _experience(winner, looser) {
        if (winner.getRole() === Entity.PLAYER) {

            const receivedExp = this._getReceivedExp(winner, looser),
                exp = winner.getStats().getExp() + receivedExp,
                neededExp = winner.getStats().getNeededExp();

            if (exp >= neededExp) {
                winner.getStats().setLevel(winner.getStats().getLevel() + 1);
            }

            winner.getStats().setExp(exp);
        }
    }

    _getReceivedExp(attacker, entity) {
        const multiplier = entity.getRole() === Entity.PLAYER ? 1.5 : 1,
            basicExp = entity.getRole() === Entity.PLAYER ? 10 : 5,
            entityLevel = entity.getStats().getLevel() || 1,
            attackerLevel = attacker.getStats().getLevel() || 1;

        return Math.ceil(
            multiplier * basicExp * entityLevel / 5 *
            Math.pow(2 * entityLevel + 10, 2.5) /
            Math.pow(entityLevel + attackerLevel + 10, 2.5) + 1
        );
    }

    _warpEntity(entity, world, maxTries) {
        let boundingBox = entity.getBoundingBox(),
            placement = world.getFreeRandomRect(boundingBox.getWidth(), boundingBox.getHeight(), maxTries);
        if (placement) {
            entity.setXY(placement.getX(), placement.getY());
        }
    }

}
