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
})(this, function (module, _babelHelpers, util, Locator, Location, action) {
    'use strict';

    var _babelHelpers2 = _babelHelpers2.default.interopRequireDefault(_babelHelpers);

    var addEventListener = util.addEventListener;
    var removeEventListener = util.removeEventListener;
    var getHash = util.getHash;
    var addQuery = util.addQuery;
    var guid = util.guid;

    var PUSH = action.PUSH;
    var REPLACE = action.REPLACE;
    var TRAVEL = action.TRAVEL;

    var HashLocator = function (_Locator) {
        _babelHelpers2.default.inherits(HashLocator, _Locator);

        function HashLocator() {
            _babelHelpers2.default.classCallCheck(this, HashLocator);

            return _babelHelpers2.default.possibleConstructorReturn(this, Object.getPrototypeOf(HashLocator).apply(this, arguments));
        }

        _babelHelpers2.default.createClass(HashLocator, [{
            key: 'getLocation',
            value: function getLocation(e) {

                return new Location(getHash(window.location), TRAVEL, guid(), '');
            }
        }, {
            key: 'finishTransit',
            value: function finishTransit(nextLocation) {

                _babelHelpers2.default.get(Object.getPrototypeOf(HashLocator.prototype), 'finishTransit', this).call(this, nextLocation);

                var action = nextLocation.action;


                switch (action) {
                    case PUSH:case REPLACE:
                        window.location.hash = nextLocation.toString();
                        return;
                }
            }
        }, {
            key: 'start',
            value: function start() {
                _babelHelpers2.default.get(Object.getPrototypeOf(HashLocator.prototype), 'start', this).call(this);
                addEventListener(window, 'hashchange', this.onLocationChange);
                return this;
            }
        }, {
            key: 'stop',
            value: function stop() {
                removeEventListener(window, 'hashchange', this.onLocationChange);
                return this;
            }
        }, {
            key: 'createHref',
            value: function createHref(pathname, query) {
                return '#' + addQuery(pathname, query);
            }
        }]);

        return HashLocator;
    }(Locator);

    module.exports = HashLocator;
});