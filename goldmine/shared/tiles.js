// vim:softtabstop=4:shiftwidth=4

define(['underscore'],
   function(_)
{
   "use strict";

   var Tiles = {
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
      MAX_ENTITIES: 407
   };

   var tileProperties = {
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

   var groundDefaultProperties = {
      walkable: true,
      large: false,
      height: 1,
      width: 1
   };

   var entityDefaultProperties = {
      walkable: false,
      large: false,
      height: 1,
      width: 1
   };

   Tiles.compile = function(collection) {
      var me = this;

      var compiled = {};
      _.each(collection, function(value, key) {
        key = key.toUpperCase();
         if (me[key] !== undefined) compiled[me[key]] = value;
      });

      return compiled;
   };

   Tiles.properties = Tiles.compile(tileProperties);

   var setDefaultProperties = function(min, max, defaults) {
      var tile;

      for (tile = min; tile <= max; tile++) {
         if (!Tiles.properties[tile]) Tiles.properties[tile] = {};

         _.defaults(Tiles.properties[tile], defaults);
      }
   };

   setDefaultProperties(Tiles.MIN_ENTITIES, Tiles.MAX_ENTITIES,
      entityDefaultProperties);

   setDefaultProperties(Tiles.MIN_GROUND, Tiles.MAX_GROUND,
      groundDefaultProperties);

   return Tiles;
});
