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
    Object.defineProperty(exports, '__esModule', { value: true });
    var _util = require('./util');
    var _Locator2 = require('./Locator');
    var _Locator3 = babelHelpers.interopRequireDefault(_Locator2);
    var _Location = require('./Location');
    var _Location2 = babelHelpers.interopRequireDefault(_Location);
    var _action = require('./action');
    var HashLocator = function (_Locator) {
        babelHelpers.inherits(HashLocator, _Locator);
        function HashLocator() {
            babelHelpers.classCallCheck(this, HashLocator);
            babelHelpers.get(Object.getPrototypeOf(HashLocator.prototype), 'constructor', this).apply(this, arguments);
        }
        babelHelpers.createClass(HashLocator, [
            {
                key: 'getLocation',
                value: function getLocation(e) {
                    return new _Location2['default']((0, _util.getHash)(window.location), _action.TRAVEL, (0, _util.guid)(), '');
                }
            },
            {
                key: 'finishTransit',
                value: function finishTransit(nextLocation) {
                    babelHelpers.get(Object.getPrototypeOf(HashLocator.prototype), 'finishTransit', this).call(this, nextLocation);
                    var action = nextLocation.action;
                    switch (action) {
                    case _action.PUSH:
                    case _action.REPLACE:
                        window.location.hash = nextLocation.toString();
                        return;
                    }
                }
            },
            {
                key: 'start',
                value: function start() {
                    babelHelpers.get(Object.getPrototypeOf(HashLocator.prototype), 'start', this).call(this);
                    (0, _util.addEventListener)(window, 'hashchange', this.onLocationChange);
                    return this;
                }
            },
            {
                key: 'stop',
                value: function stop() {
                    (0, _util.removeEventListener)(window, 'hashchange', this.onLocationChange);
                    return this;
                }
            },
            {
                key: 'createHref',
                value: function createHref(pathname, query) {
                    return '#' + (0, _util.addQuery)(pathname, query);
                }
            }
        ]);
        return HashLocator;
    }(_Locator3['default']);
    exports['default'] = HashLocator;
    module.exports = exports['default'];
});