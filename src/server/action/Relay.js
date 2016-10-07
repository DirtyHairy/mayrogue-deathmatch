import Observable from '../../util/Observable';

export default class ActionRelay extends Observable {

    dispatchAction(action, originator) {
        this.fireEvent('action', action, originator);
    }

}