import types from './types';
import Movement from './Movement';
import AddEntity from './AddEntity';
import RemoveEntity from './RemoveEntity';
import Stats from './Stats';

export function serialize(change) {
    return {
        type: change.type,
        data: change.serialize()
    };
}

 /**
  * Unserialize a change, inferring the type from the blob.
  */
 export function unserialize(blob) {
     switch (blob.type) {
         case (types.MOVEMENT):
             return Movement.unserialize(blob.data);

         case (types.ADD_ENTITY):
             return AddEntity.unserialize(blob.data);

         case (types.REMOVE_ENTITY):
             return RemoveEntity.unserialize(blob.data);

         case (types.STATS):
             return Stats.unserialize(blob.data);
         default:
             return null;
     }
 }
