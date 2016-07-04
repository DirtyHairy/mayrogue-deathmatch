/* global $ */
import 'babel-polyfill';
import startDispatcher from './dispatch';

let modal = $('#loginModal'),
    input = $('#inputUsername'),
    inputForceTouch = $('#inputForceTouch'),
    button = $('#btnLogin'),
    username = null,
    forceTouch = null;

modal.on('shown', function() {
    input.val('');
    if (input.has('error')) {
        input.removeClass('error');
    }
    input.focus();
});

modal.on('hidden', function() {
    startDispatcher(username, forceTouch);
    $('#main').show();
});

input.on('keypress', function(event) {
    if (13 !== event.which) {
        return;
    }

    event.preventDefault();
    button.focus().delay(25).click();
});

button.on('click', function() {
    let val = input.val().trim();
    if (!val) {
        return;
    }

    username = val;
    forceTouch = inputForceTouch.is(':checked');
    modal.modal('hide');
});

modal.modal('show');
