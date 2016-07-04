/* global $ */

export default class StatsView {

    constructor({elt, player = null}) {
        this._player = player;
        this._elt = elt;

        this._nameField = $(this._elt).find('.name_field').get(0);
        this._levelField = $(this._elt).find('.level_field').get(0);

        this._hpBar = $(this._elt).find('.hp_bar').get(0);
        this._hpBarProgress = $(this._elt).find('.hp_bar_progress').get(0);

        this._expBar = $(this._elt).find('.exp_bar').get(0);
        this._expBarProgress = $(this._elt).find('.exp_bar_progress').get(0);

        if (player) {
            this._setPlayer(player);
            this._render();
        }
    }

    getElt() {
        return this._elt;
    }

    _render() {
        if (!this._player) {
            return;
        }
        const stats = this._player.getStats();

        this._nameField.innerHTML = stats.getName();
        this._levelField.innerHTML = 'Level: ' + stats.getLevel();

        this._renderHP(stats);
        this._renderEXP(stats);
    }

    _renderHP(stats) {
        const hp = stats.getHp();
        const percent = (hp / stats.getMaxHp()) * 100;

        if (percent <= 25) {
            this._hpBar.setAttribute("class", "progress progress-danger");
        } else if (percent <= 50) {
            this._hpBar.setAttribute("class", "progress progress-warning");
        } else {
            this._hpBar.setAttribute("class", "progress progress-success");
        }

        this._hpBarProgress.style.width = percent + '%';
        this._hpBarProgress.innerHTML = hp + " HP";
    }

    _renderEXP(stats) {
        const exp = stats.getExp() || 0;
        const percent = (exp / stats.getNeededExp()) * 100;

        this._expBarProgress.style.width = percent + '%';
        this._expBarProgress.innerHTML = exp + " EXP";
    }

    setPlayer(player) {
        const listenersConfig = {
            'statsChange': this._render
        };

        if (this._player) {
            this._player.detachListeners(listenersConfig, this);
        }
        this._player = player;
        if (this._player) {
            this._player.attachListeners(listenersConfig, this);
        }

        if (this._nameField) {
            this._render();
        }
    }
}
