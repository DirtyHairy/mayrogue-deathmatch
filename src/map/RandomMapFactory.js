import tiles from '../tiles';

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
        this._rng = rng;
    }

    getWidth() {
        return this._width;
    }

    getHeight() {
        return this._height;
    }

    /*
     * generate a random tile...
     */
    _randomTile(candidates) {
        let weights;

        if (typeof(candidates) === 'undefined') {
            weights = this._weights;
        } else {
            weights = {};
            candidates.forEach(candidate => weights[candidate] = this._weights[candidate]);
        }

        let norm = 0;
        for (let weight of weights) {
            norm += weight;
        }

        let w = this._rng() * norm;

        for (let tile in weights) {
            if (!weights.hasOwnProperty(tiles)) {
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
     * smooth the generated world
     *
     * @see http://roguebasin.roguelikedevelopment.org/index.php?title=Cellular_Automata_Method_for_Generating_Random_Cave-Like_Levels
     */
    _smooth(dataIn) {
        let dataOut = [];

        for (let x = 0; x < this._width; x++) {
            dataOut[x] = [];
            for (let y = 0; y < this._height; y++) {
                if (this._isBorder(x, y) ||
                    this._countSurroundingFloorTiles(dataIn, x, y) >= 5 ||
                    this._countSurroundingFloorTiles(dataIn, x, y, {distance: 2, corners: false}) <= 2) {
                    dataOut[x][y] = this._randomStone();
                } else {
                    dataOut[x][y] = this._randomFloor();
                }
            }
        }

        return dataOut;
    }

    /*
     * check if x,y is a border tile
     */
    _isBorder(x, y) {
        return x === 0 || y === 0 || x >= this._width - 1 || y >= this._height - 1;
    }

    /*
     * count how many tiles around (x,y) are stone tiles (within one step)
     */
    _countSurroundingStoneTiles(data, x, y, {corners = true, distance = 2} = {}) {
        let stoneTileCount = 0;

        for (let posX = x - distance; posX <= x + distance; posX++) {
            for (let posY = y - distance; posY <= y + distance; posY++) {

                if (!this._insideMap(posX, posY)) {
                    continue;
                }

                if (!corners && Math.abs(x - posX) === 2 && Math.abs(y - posY) === 2)  {
                    continue;
                }

                if (tiles.STONE === data[posX][posY] ||
                    tiles.STONE2 === data[posX][posY]) {
                    stoneTileCount++;
                }
            }
        }

        return stoneTileCount;
    }

    _countSurroundingFloorTiles(data, x, y, options) {
        return 9 - this._countSurroundingStoneTiles(data, x, y, options);
    }

    _insideMap(x, y) {
        return x > 0 && x < this._width && y > 0 && y < this._height;
    }

}
