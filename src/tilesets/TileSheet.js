// vim:softtabstop=4:shiftwidth=4

import * as _ from 'lodash';
import BaseTileSheet from './BaseTileSheet';

/**
 * Tilesheet. Provides a set of tiles from a spritesheet image.
 *
 * Tile shapes are defined by a mapping definition. The mapping definition
 * is an associative array mapping tile types to arrays of tile positions on the
 * sheet in the
 *
 */
export default class TileSheet extends BaseTileSheet {

    constructor(config) {
        super();

        this._url = config.url;
        this._tileWidth = config.tileWidth;
        this._tileHeight = config.tileHeight;

        this._image = null;
        this._origin = {x: 0, y: 0};

        this._mapping = {};
        _.each(config.mapping, (def, tile) => {
            this._mapping[tile] = this._resolveTile(def, config.mapping);
        });

        this._image = new Image();
        this.ready = new Promise((resolve) => {
            this._image.addEventListener('load', () => {
                resolve();
            });
        });

        this._image.src = this._url;
    }

    _resolveTile(tile, mapping, target) {
        if (!target) {
            target = [];
        }

        if (_.isArray(tile)) {
            _.each(tile, (atom) => {
                this._resolveTile(atom, mapping, target);
            });
        } else if (_.isObject(tile)) {
            target.push(tile);
        } else {
            this._resolveTile(mapping[tile], mapping, target);
        }

        return target;
    }

    _drawTo(context, x, y, ix, iy) {
        context.drawImage(this._image,
            ix * this._tileWidth,
            iy * this._tileHeight,
            this._tileWidth,
            this._tileHeight,
            x,
            y,
            this.width,
            this.height
        );
    }

    drawWorldTo(context, x, y, tile) {
        const def = this._mapping[tile];

        if (!def) {
            return false;
        }

        for (let i = 0; i < def.length; i++) {
            this._drawTo(context, x, y, def[i].ix, def[i].iy);
        }
        return true;
    }

    getTextureCoords(tileId, entity) {
        const def = this._mapping[tileId];

        if (def.length !== 1) {
            //console.log(def.length);
            //console.log("multi-tiles "+def.length+" per tile is not yet supported");
        }

        let realDef = def[0];

        if (def[0].heading && entity !== undefined) {
            realDef = def[0][entity.getHeading()];
        }

        return {
            x: realDef.ix * this._tileWidth / this._image.width,
            y: realDef.iy * this._tileWidth / this._image.height,
            w: this._tileWidth / this._image.width,
            h: this._tileHeight / this._image.height
        };
    }

    isMapping(tileId) {
        return this._mapping[tileId] !== undefined;
    }

    drawEntityTo(context, x, y, entity) {
        const tile = entity.getShape();

        const def = this._mapping[tile];

        if (!def) {
            return false;
        }

        let ix, iy;
        for (let i = 0; i < def.length; i++) {

            if (def[i].heading) {

                ix = def[i][entity.getHeading()].ix;
                iy = def[i][entity.getHeading()].iy;


            } else {
                ix = def[i].ix;
                iy = def[i].iy;
            }

            this._drawTo(context, x, y, ix, iy);
        }

        this._drawEntityStats(context, x, y, entity);

        return true;
    }

    _drawEntityStats(context, x, y, entity) {
        //noinspection JSUnusedLocalSymbols
        const stats = entity.getStats();

        const name = stats.getName();
        let text = '';
        if (name) {
            text += (name + ', ');
        }
        text += ("HP: " + entity.getStats().getHp());

        context.fillText(text, x, y);
    }

}
