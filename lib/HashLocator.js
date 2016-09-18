(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['module', './babelHelpers', './util', './Locator', './Location', './action'], factory);
    } else if (typeof exports !== "undefined") {
        factory(module, require('./babelHelpers'), require('./util'), require('./Locator'), require('./Location'), require('./action'));
    } else {
        var mod = {
            exports: {}
        };
        factory(mod, global.babelHelpers, global.util, global.Locator, global.Location, global.action);
        global.HashLocator = mod.exports;
    }
})(this, function (module, babelHelpers, _require, Locator, Location, _require2) {
    'use strict';

    var addEventListener = _require.addEventListener;
    var removeEventListener = _require.removeEventListener;
    var getHash = _require.getHash;
    var addQuery = _require.addQuery;
    var guid = _require.guid;
    var PUSH = _require2.PUSH;
    var REPLACE = _require2.REPLACE;
    var TRAVEL = _require2.TRAVEL;

    var HashLocator = function (_Locator) {
        babelHelpers.inherits(HashLocator, _Locator);

        function HashLocator() {
            babelHelpers.classCallCheck(this, HashLocator);
            return babelHelpers.possibleConstructorReturn(this, _Locator.apply(this, arguments));
        }

        HashLocator.prototype.getLocation = function getLocation(e) {

            return new Location(getHash(window.location), TRAVEL, guid(), '');
        };

        HashLocator.prototype.finishTransit = function finishTransit(nextLocation) {

            _Locator.prototype.finishTransit.call(this, nextLocation);

            switch (nextLocation.action) {
                case PUSH:case REPLACE:
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
//# sourceMappingURL=HashLocator.js.map
