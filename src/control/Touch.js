import * as _ from 'lodash';
import * as FastClick from 'fastclick';
import Observable from '../util/Observable';
import ControlTypes from './types';

export default class TouchControl extends Observable {

    constructor(config) {

        super();

        this._controlElements = null;
        this._engagedControl = null;

        this._canvasElement = config.canvasElement;
        this._controlElement = config.controlElement;

        let fastclick;
        fastclick = new FastClick(this._controlElement);
        fastclick = new FastClick(this._canvasElement);

        this._createControlElements();
        this._attachHandlers();

        this._controlElement.style.visibility = "visible";
    }

    _createControlElements() {
        const movementButtonMap = {
            up: ControlTypes.MOVE_UP,
            left: ControlTypes.MOVE_LEFT,
            right: ControlTypes.MOVE_RIGHT,
            down: ControlTypes.MOVE_DOWN
        };

        this._controlElements = _.map(movementButtonMap, (controlType, tag) => {
            const control = document.createElement("input");

            control.id = 'control_' + tag;
            control.type = "button";
            control.value = tag;
            control.className += ' btn';
            control.style.visibility = 'visible';

            this._controlElement.appendChild(control);

            return {
                elt: control,
                type: controlType
            };
        });

        this._controlElements.push({
            elt: this._canvasElement,
            type: ControlTypes.ATTACK
        });
    }

    _attachHandlers() {
        _.each(this._controlElements, (controlElement) => {
            const touchStartHandler = () => {
                if (!this._engagedControl) {
                    this._engagedControl = controlElement.type;
                    this.fireEvent('engage', controlElement.type);
                }
            };

            controlElement.elt.addEventListener('mousedown', touchStartHandler);
            controlElement.elt.addEventListener('touchstart', touchStartHandler);
        });

        const touchEndHandler = () => {
            if (this._engagedControl) {
                this.fireEvent('disengage', this._engagedControl);
                this._engagedControl = null;
            }
        };

        document.addEventListener('mouseup', touchEndHandler);
        document.addEventListener('touchend', touchEndHandler);
    }

}
