import types from './types';
import MoveAction from './Move';
import AttackAction from './Attack';

export function serialize(action) {
    return {
        type: action.type,
        data: action.serialize()
    };
}

export function unserialize(blob) {
    switch (blob.type) {
        case types.MOVE:
            return MoveAction.unserialize(blob.data);

        case types.ATTACK:
            return AttackAction.unserialize(blob.data);

        default:
            throw new Error(`invalid action type '${blob.type}'`);
    }
}
