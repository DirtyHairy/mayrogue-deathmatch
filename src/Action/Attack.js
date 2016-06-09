import types from './types';
import AbstractAction from './Abstract';

export default class AttackAction extends AbstractAction {

    get type() {
        return types.ATTACK;
    }

    validate() {
        return true;
    }

    serialize() {
        return {};
    }

    static unserialize() {
        return new AttackAction();
    }
}
