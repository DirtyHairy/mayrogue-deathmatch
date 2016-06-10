 export function serialize(change) {
     return {
         type: change.type,
         data: change.serialize()
     };
 }
