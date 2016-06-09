import tiles from '../tiles';
import Map from './Map';
import DomainMap from './DomainMap';
import * as gamlib from '../vendor/gamlib-ai';

export default class RandomMapFactory {

    constructor(width, height, rng, weights = {}) {
        this._weights = tiles.compile(Object.assign({
            forest: 1,
            forest1: 1,
            forest2: 1,
            forest3: 1,
            flower_white: 1,
            flower_red: 1,
            stone: 30,
            stone2: 30,
            dirt: 5,
            grass: 70
        }, weights));

        this._width = width;
        this._height = height;
        this._smoothingFactor = 1;
        this._rng = rng;
    }

    create() {
        let map = new Map(
            this._width,
            this._height
        );

        for (let x = 0; x < this._width; x++) {
            for (let y = 0;  y < this._height; y++) {
                map.updateField(x, y, this._randomTile());
            }
        }

        for (let i = 0; i < this._smoothingFactor; i++) {
            map = this._smooth(map);
        }

        this.connectDomains(map);

        return map;
    }

    _randomTile(candidates) {
        let weights;

        if (typeof(candidates) === 'undefined') {
            weights = this._weights;
        } else {
            weights = {};
            candidates.forEach(candidate => weights[candidate] = this._weights[candidate]);
        }

        let norm = 0;

        Object.keys(weights).forEach((key) => norm += weights[key]);
        let w = this._rng() * norm;

        for (let tile in weights) {
            if (!weights.hasOwnProperty(tile)) {
                continue;
            }

            if (w < weights[tile]) {
                return tile;
            } else {
                w -= weights[tile];
            }
        }

        return null;
    }

    _randomFloor() {
        return this._randomTile([
            tiles.FOREST,
            tiles.FOREST1,
            tiles.FOREST2,
            tiles.FOREST3,
            tiles.GRASS,
            tiles.DIRT,
            tiles.FLOWER_WHITE,
            tiles.FLOWER_RED
        ]);
    }

    _randomStone() {
        return this._randomTile([tiles.STONE, tiles.STONE2]);
    }

    /*
     * @see http://roguebasin.roguelikedevelopment.org/index.php?title=Cellular_Automata_Method_for_Generating_Random_Cave-Like_Levels
     */
    _smooth(map) {
        const newMap = new Map(this._width, this._height);

        for (let x = 0; x < this._width; x++) {
            for (let y = 0; y < this._height; y++) {
                if (
                    map.isBorder(x, y) ||
                    map.countSurroundingFloorTiles(x, y) >= 5 ||
                    map.countSurroundingFloorTiles(x, y, {distance: 2, corners: false}) <= 2
                ) {
                    newMap.updateField(x, y, this._randomStone());
                } else {
                    newMap.updateField(x, y, this._randomFloor());
                }
            }
        }

        return newMap;
    }

    /**
     * Find disconnected domains and reconnect them. The algorithm works by first identifying all domains
     * and then using the A* pathfinder to connect them, removing obstacles along the way. We assign a high penality
     * to unaccessible fields, so the pathfinder will keep the rock drilling to a minimum
     *
     * @private
     */
    connectDomains(map) {

        const domainMap = new DomainMap(
            this._width,
            this._height,
            (x, y) => map.fieldAccessible(x, y)
        );

        let domains = domainMap.getDomains();

        if (domains.length <= 1) {
            return;
        }

        let baseDomain = domains[0],
            baseField = domainMap.findFieldInDomain(baseDomain);

        let aStarGrid = new gamlib.AStarArray(this._width, this._height);
        for (let x = 0; x < this._width; x++) {
            for (let y = 0; y < this._height; y++) {
                aStarGrid.setValue(x, y, map.fieldAccessible(x, y) ? 0 : 100);
            }
        }

        for (let domain of domainMap.getDomains()) {
            if (domain === baseDomain) {
                continue;
            }
            let field = domainMap.findFieldInDomain(domain),
                path = aStarGrid.find(baseField.x, baseField.y, field.x, field.y);

            for (let node of path) {
                let pos = node.position;
                if (!map.fieldAccessible(pos.x, pos.y)) {
                    map.updateField(pos.x, pos.y, this._randomFloor());
                    aStarGrid.setValue(pos.x, pos.y, 0);
                }
            }
        }

    }
}
