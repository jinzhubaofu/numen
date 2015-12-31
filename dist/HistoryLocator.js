define('numen/HistoryLocator', [
    'require',
    'exports',
    'module',
    './babelHelpers',
    './Locator',
    './Location',
    './util',
    './action'
], function (require, exports, module) {
    var babelHelpers = require('./babelHelpers');
    var Locator = require('./Locator');
    var Location = require('./Location');
    var util = require('./util');
    var addEventListener = util.addEventListener;
    var removeEventListener = util.removeEventListener;
    var guid = util.guid;
    var action = require('./action');
    var PUSH = action.PUSH;
    var REPLACE = action.REPLACE;
    var TRAVEL = action.TRAVEL;
    var HISTORY_LOCATOR_STATE_ID_KEY = '__hlik__';
    var HistoryLocator = function (_Locator) {
        babelHelpers.inherits(HistoryLocator, _Locator);
        function HistoryLocator() {
            babelHelpers.classCallCheck(this, HistoryLocator);
            _Locator.apply(this, arguments);
        }
        HistoryLocator.prototype.start = function start() {
            _Locator.prototype.start.call(this);
            addEventListener(window, 'popstate', this.onLocationChange);
            return this;
        };
        HistoryLocator.prototype.stop = function stop() {
            removeEventListener(window, 'popstate', this.onLocationChange);
            return this;
        };
        HistoryLocator.prototype.getLocation = function getLocation(e) {
            var state = e && e.state || window.history.state || {};
            var id = state[HISTORY_LOCATOR_STATE_ID_KEY];
            var loc = window.location;
            var pathname = loc.pathname;
            var search = loc.search;
            var hash = loc.hash;
            var path = pathname + search + hash;
            if (!id) {
                var _babelHelpers$_extends;
                id = guid();
                window.history.replaceState(babelHelpers._extends({}, state, (_babelHelpers$_extends = {}, _babelHelpers$_extends[HISTORY_LOCATOR_STATE_ID_KEY] = id, _babelHelpers$_extends)), null, path);
            }
            return new Location(path, TRAVEL, id, '');
        };
        HistoryLocator.prototype.finishTransit = function finishTransit(nextLocation) {
            var _state;
            var action = nextLocation.action;
            var title = nextLocation.title;
            var state = (_state = {}, _state[HISTORY_LOCATOR_STATE_ID_KEY] = nextLocation.id, _state);
            switch (action) {
            case PUSH:
                window.history.pushState(state, title, nextLocation.toString());
                break;
            case REPLACE:
                window.history.replaceState(state, title, nextLocation.toString());
                break;
            }
            _Locator.prototype.finishTransit.call(this, nextLocation);
        };
        HistoryLocator.prototype.createHref = function createHref(nextLocation) {
            return nextLocation ? nextLocation.toString() : 'javascript: void 0';
        };
        HistoryLocator.prototype.dispose = function dispose() {
            this.stop();
            this.listeners.length = 0;
        };
        return HistoryLocator;
    }(Locator);
    module.exports = HistoryLocator;
});