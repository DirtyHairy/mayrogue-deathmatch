define(['jquery', 'dispatch', 'bootstrap'], function($, dispatch) {
    "use strict";

    var modal = $('#loginModal'),
        input = $('#inputUsername'),
        inputUseWebGL = $('#inputUseWebGL'),
        inputForceTouch = $('#inputForceTouch'),
        button = $('#btnLogin'),
        username = null,
        useWebGL = null,
        forceTouch = null;

    modal.on('shown', function() {
        input.val('');
        if (input.has('error')) input.removeClass('error');
        input.focus();
    });

    modal.on('hidden', function() {
        dispatch(username, useWebGL, forceTouch);
        $('#main').show();
    });

    input.on('keypress', function(event) {
        if (13 !== event.which) return;

        event.preventDefault();
        button.focus().delay(25).click();
    });

    button.on('click', function() {
        var val = input.val().trim();
        if (!val) return;

        username = val;
        useWebGL = inputUseWebGL.is(':checked');
        forceTouch = inputForceTouch.is(':checked');
        modal.modal('hide');
    });

    modal.modal('show');
});
