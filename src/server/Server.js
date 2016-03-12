import * as path from 'path';
import * as http from 'http';
import serveStatic from 'serve-static';
import morgan from 'morgan';
import express from 'express';

export default class Server {

    constructor() {
        this._port = 3000;
        this._root = path.join(__dirname, '../../www');
        this._production = false;

        this._app = null;
        this._server = null;
        this._io = null;
    }

    setPort(port) {
        this._port = port;
    }

    setProductionMode(production) {
        this._production = production;
    }

    start() {
        this._app = express();
        this._server = http.createServer(this._app);

        if (!this._production) {
            this._app.use(morgan('dev'));
        }

        this._initMiddleware();
        this._server.listen(this._port);

        mayrogue.log.info(`server running, listening on port ${this._port}`);
    }

    _initMiddleware() {
        this._app.use(serveStatic(this._root));
    }

}
