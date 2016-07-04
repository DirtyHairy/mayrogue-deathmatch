// vim:softtabstop=4:shiftwidth=4

import * as _ from 'lodash';
import BaseTileSheet from './BaseTileSheet';
import Semaphore from '../util/Semaphore';

export default class TileSheetCollection extends BaseTileSheet {

    constructor(config) {
        super();

        this._semaphore = null;

        this._members = config.members;

        if (config.width) {
            this.setWidth(config.width);
        } else if (this._members[0]) {
            this.setWidth(this._members[0].width);
        }

        if (config.height) {
            this.setHeight(config.height);
        } else if (this._members[0]) {
            this.setHeight(this._members[0].height);
        }

        if (this._members.length > 0) {
            this._semaphore = new Semaphore(0);

            this.ready = new Promise((resolve) => {
                this._semaphore.when(
                    this._members.length,
                    () => {
                        resolve();
                    }
                );
            });

            _.each(this._members, (tilesheet) => {
                tilesheet.ready.then(_.bind(this._semaphore.raise, this._semaphore));
            });
        }

    }

    setWidth(width) {
        this.width = width;
        _.each(this._members, (tilesheet) => {
            tilesheet.setWidth(width);
        });

        return this;
    }

    setHeight(height) {
        this.height = height;
        _.each(this._members, (tilesheet) => {
            tilesheet.setHeight(height);
        });

        return this;
    }

    drawWorldTo(context, x, y, tile) {
        return _.some(this._members, (tilesheet) => {
            return tilesheet.drawWorldTo(context, x, y, tile);
        });
    }

    drawEntityTo(context, x, y, entity) {
        return _.some(this._members, (tilesheet) => {
            return tilesheet.drawEntityTo(context, x, y, entity);
        });
    }

    getTileWidth() {
        if (this._members.length > 0) {
            return this._members[0].getTileWidth();
        }
        return null;
    }

    getTileHeight() {
        if (this._members.length > 0) {
            return this._members[0].getTileHeight;
        }
        return null;
    }

    getTileSheet(tileId) {
        let i;
        for (i = 0; i < this._members.length; i++) {
            if (this._members[i].isMapping(tileId)) {
                return this._members[i];
            }
        }
        return null;
    }

}
