// vim:softtabstop=4:shiftwidth=4

import TileSheet from './TileSheet';
import Tiles from '../tiles';

export default class TileSheetLarge  extends TileSheet {

    constructor(config) {
        super(config);
    }

    _drawTo(context, x, y, ix, iy, width, height) {
        context.drawImage(this._image,
            ix * this._tileWidth,
            iy * this._tileHeight,
            this._tileWidth * width,
            this._tileHeight * height,
            x,
            y,
            this.width * width,
            this.height * height
        );
    }

    drawEntityTo(context, x, y, entity) {
        const tile = entity.getShape();
        const tiledef = Tiles.properties[tile];
        const def = this._mapping[tile];

        if (!def) {
            return false;
        }

        for (let i = 0; i < def.length; i++) {
            this._drawTo(
                context,
                x,
                y,
                def[i].ix,
                def[i].iy,
                tiledef.width,
                tiledef.height
            );
        }

        this._drawEntityStats(context, x, y, entity);

        return true;
    }

    isMapping(tileId) {
        return this._mapping[tileId] !== undefined;
    }

}
