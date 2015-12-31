define('numen/HashLocator', [
    'require',
    'exports',
    'module',
    './babelHelpers',
    './util',
    './Locator',
    './Location',
    './action'
], function (require, exports, module) {
    var babelHelpers = require('./babelHelpers');
    var util = require('./util');
    var addEventListener = util.addEventListener;
    var removeEventListener = util.removeEventListener;
    var getHash = util.getHash;
    var addQuery = util.addQuery;
    var guid = util.guid;
    var Locator = require('./Locator');
    var Location = require('./Location');
    var action = require('./action');
    var PUSH = action.PUSH;
    var REPLACE = action.REPLACE;
    var TRAVEL = action.TRAVEL;
    var HashLocator = function (_Locator) {
        babelHelpers.inherits(HashLocator, _Locator);
        function HashLocator() {
            babelHelpers.classCallCheck(this, HashLocator);
            _Locator.apply(this, arguments);
        }
        HashLocator.prototype.getLocation = function getLocation(e) {
            return new Location(getHash(window.location), TRAVEL, guid(), '');
        };
        HashLocator.prototype.finishTransit = function finishTransit(nextLocation) {
            _Locator.prototype.finishTransit.call(this, nextLocation);
            var action = nextLocation.action;
            switch (action) {
            case PUSH:
            case REPLACE:
                window.location.hash = nextLocation.toString();
                return;
            }
        };
        HashLocator.prototype.start = function start() {
            _Locator.prototype.start.call(this);
            addEventListener(window, 'hashchange', this.onLocationChange);
            return this;
        };
        HashLocator.prototype.stop = function stop() {
            removeEventListener(window, 'hashchange', this.onLocationChange);
            return this;
        };
        HashLocator.prototype.createHref = function createHref(pathname, query) {
            return '#' + addQuery(pathname, query);
        };
        return HashLocator;
    }(Locator);
    module.exports = HashLocator;
});