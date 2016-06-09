export default class DeadBrain {

    constructor() {
        this._entity = null;
    }

    tick() {}

    setEntity(entity) {
        this._entity = entity;
    }

    detach() {
        this._entity = null;
    }

}
