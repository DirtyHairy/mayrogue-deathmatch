import * as _ from 'lodash';

const Tiles = {
   FOREST: 0,
   FOREST1: 1,
   FOREST2: 2,
   FOREST3: 3,
   GRASS: 4,
   DIRT: 5,
   STONE: 6,
   STONE2: 9,
   FLOWER_WHITE: 7,
   FLOWER_RED: 8,

   HUNTER: 400,
   LICHKING: 401,
   OGRE: 402,
   SPIDER: 403,
   SNAKE: 404,
   CTHULHU_GUY: 405,
   WARRIOR: 406,
   MAGE: 407,

   MIN_GROUND: 0,
   MAX_GROUND: 9,

   MIN_ENTITIES: 400,
   MAX_ENTITIES: 407,

   compile(collection) {
      const compiled = {};

      _.each(collection, (value, key) => {
        key = key.toUpperCase();
         if (this[key] !== undefined) compiled[this[key]] = value;
     });

      return compiled;
   }
};

const tileProperties = {
   stone: {
       walkable: false
   },
   stone2: {
       walkable: false
   },
   cthulhu_guy: {
      large: true,
      width: 2,
      height: 2
   }
};

const groundDefaultProperties = {
   walkable: true,
   large: false,
   height: 1,
   width: 1
};

const entityDefaultProperties = {
   walkable: false,
   large: false,
   height: 1,
   width: 1
};

Tiles.properties = Tiles.compile(tileProperties);

function setDefaultProperties(min, max, defaults) {
   for (let tile = min; tile <= max; tile++) {
      if (!Tiles.properties[tile]) Tiles.properties[tile] = {};

      _.defaults(Tiles.properties[tile], defaults);
   }
}

setDefaultProperties(Tiles.MIN_ENTITIES, Tiles.MAX_ENTITIES,
   entityDefaultProperties);

setDefaultProperties(Tiles.MIN_GROUND, Tiles.MAX_GROUND,
   groundDefaultProperties);

export default Tiles;
