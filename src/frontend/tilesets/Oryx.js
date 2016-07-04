// vim:softtabstop=4:shiftwidth=4

import tiles from '../../tiles';
import TileSheet from '../../tilesets/TileSheet';
import TileSheetLarge from '../../tilesets/TileSheetLarge';
import TileSheetCollection from '../../tilesets/TileSheetCollection';

const tilesheetTerrain = new TileSheet({
    url: '/img/terrain.gif',
    tileWidth: 32,
    tileHeight: 32,

    mapping: tiles.compile({
        grass: {ix: 6, iy: 4},
        forest: [tiles.GRASS, {ix: 9, iy: 4}],
        forest1: [tiles.GRASS, {ix: 14, iy: 4}],
        forest2: [tiles.GRASS, {ix: 15, iy: 4}],
        forest3: [tiles.GRASS, {ix: 16, iy: 4}],
        flower_white: [tiles.GRASS, {ix: 14, iy: 6 }],
        flower_red: [tiles.GRASS, {ix: 15, iy: 6 }],
        dirt: {ix: 11, iy: 1},
        stone: {ix: 3, iy: 0},
        stone2: {ix: 5, iy: 0}
    })
});

const tilesheetActors = new TileSheet({
    url: '/img/actors.gif',
    tileWidth: 32,
    tileHeight: 32,
    mapping: tiles.compile({
        hunter: {heading: true, east: {ix: 0, iy: 9}, south: {ix: 1, iy: 9}, west: {ix: 2, iy: 9}, north: {ix: 3, iy: 9}},
        warrior: {heading: true, east: {ix: 4, iy: 9}, south: {ix: 5, iy: 9}, west: {ix: 6, iy: 9}, north: {ix: 7, iy: 9}},
        mage: {heading: true, east: {ix: 8, iy: 9}, south: {ix: 9, iy: 9}, west: {ix: 10, iy: 9}, north: {ix: 11, iy: 9}},
        lichking: {ix: 6, iy: 1},
        ogre: {ix:6, iy: 2},
        spider: {ix: 2, iy:4},
        snake: {ix: 11, iy:1}
    })
});

const tilesheetLargeActors = new TileSheetLarge({
    url: '/img/actors.gif',
    tileWidth: 32,
    tileHeight: 32,
    mapping: tiles.compile({
        cthulhu_guy: {ix: 14, iy: 11}
    })
});

const OryxTileSheet = new TileSheetCollection({
    members: [tilesheetTerrain, tilesheetActors, tilesheetLargeActors]
});

export default OryxTileSheet;
