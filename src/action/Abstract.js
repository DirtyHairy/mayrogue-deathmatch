export default class AbstractAction {

    constructor(deadTime = 150) {
        this._deadTime = deadTime;
    }

    getDeadTime() {
        return this._deadTime;
    }

    validate() {
        return false;
    }

}
