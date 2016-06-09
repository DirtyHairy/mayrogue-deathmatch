import types from './types';
import AbstractAction from './Abstract';

export default class AttackAction extends AbstractAction {

    get type() {
        return types.ATTACK;
    }

}
