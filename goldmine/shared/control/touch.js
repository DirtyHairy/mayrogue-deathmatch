define(['underscore', 'util', 'fastclick', 'control/types'],
    function(_, Util, FastClick, ControlTypes)
{
    "use strict";

    // We use this to pacify jshint
    var fastclick;

    var touchControls = Util.extend(Util.Base, {

        mixins: [Util.Observable],
        properties: [
            'controlElement',
            'canvasElement'
        ],

        _controlElements: null,
        _engagedControl: null,

        /**
         * constructor
         */
        create: function(config) {
            var me = this;
            Util.Base.prototype.create.apply(me, arguments);
            Util.Observable.prototype.create.apply(me, arguments);

            me.getConfig(config, ['controlElement', 'canvasElement']);


            //noinspection JSUnusedAssignment
            fastclick = new FastClick(me._controlElement);
            fastclick = new FastClick(me._canvasElement);

            me._createControlElements();
            me._attachHandlers();

            me._controlElement.style.visibility = "visible";
        },

        _createControlElements: function() {
            var me = this,
                movementButtonMap = {
                    up: ControlTypes.MOVE_UP,
                    left: ControlTypes.MOVE_LEFT,
                    right: ControlTypes.MOVE_RIGHT,
                    down: ControlTypes.MOVE_DOWN
                };

            me._controlElements = _.map(movementButtonMap, function(controlType, tag) {
                var control = document.createElement("input");

                control.id = 'control_' + tag;
                control.type = "button";
                control.value = tag;
                control.className += ' btn';
                control.style.visibility = 'visible';

                me._controlElement.appendChild(control);

                return {
                    elt: control,
                    type: controlType
                };
            });

            me._controlElements.push({
                elt: me._canvasElement,
                type: ControlTypes.ATTACK
            });
        },

        _attachHandlers: function() {
            var me = this;

            _.each(me._controlElements, function(controlElement) {
                var touchStartHandler = function() {
                    if (!me._engagedControl) {
                        me._engagedControl = controlElement.type;
                        me.fireEvent('engage', controlElement.type);
                    }
                };

                controlElement.elt.addEventListener('mousedown', touchStartHandler);
                controlElement.elt.addEventListener('touchstart', touchStartHandler);
            });

            var touchEndHandler = function() {
                if (me._engagedControl) {
                    me.fireEvent('disengage', me._engagedControl);
                    me._engagedControl = null;
                }
            };

            document.addEventListener('mouseup', touchEndHandler);
            document.addEventListener('touchend', touchEndHandler);
        }
    });

    return touchControls;
});