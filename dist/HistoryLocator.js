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
    Object.defineProperty(exports, '__esModule', { value: true });
    var _Locator2 = require('./Locator');
    var _Locator3 = babelHelpers.interopRequireDefault(_Locator2);
    var _Location = require('./Location');
    var _Location2 = babelHelpers.interopRequireDefault(_Location);
    var _util = require('./util');
    var _action = require('./action');
    var HistoryLocator = function (_Locator) {
        babelHelpers.inherits(HistoryLocator, _Locator);
        function HistoryLocator() {
            babelHelpers.classCallCheck(this, HistoryLocator);
            babelHelpers.get(Object.getPrototypeOf(HistoryLocator.prototype), 'constructor', this).apply(this, arguments);
        }
        babelHelpers.createClass(HistoryLocator, [
            {
                key: 'start',
                value: function start() {
                    babelHelpers.get(Object.getPrototypeOf(HistoryLocator.prototype), 'start', this).call(this);
                    (0, _util.addEventListener)(window, 'popstate', this.onLocationChange);
                    return this;
                }
            },
            {
                key: 'stop',
                value: function stop() {
                    (0, _util.removeEventListener)(window, 'popstate', this.onLocationChange);
                    return this;
                }
            },
            {
                key: 'getLocation',
                value: function getLocation() {
                    var loc = window.location;
                    var pathname = loc.pathname;
                    var search = loc.search;
                    var hash = loc.hash;
                    var path = pathname + search + hash;
                    return new _Location2['default'](path, _action.TRAVEL, (0, _util.guid)(), '');
                }
            },
            {
                key: 'finishTransit',
                value: function finishTransit(nextLocation) {
                    var action = nextLocation.action;
                    var title = nextLocation.title;
                    switch (action) {
                    case _action.PUSH:
                        window.history.pushState(null, title, nextLocation.toString());
                        break;
                    case _action.REPLACE:
                        window.history.replaceState(null, title, nextLocation.toString());
                        break;
                    }
                    babelHelpers.get(Object.getPrototypeOf(HistoryLocator.prototype), 'finishTransit', this).call(this, nextLocation);
                }
            },
            {
                key: 'createHref',
                value: function createHref(nextLocation) {
                    return nextLocation ? nextLocation.toString() : 'javascript: void 0';
                }
            },
            {
                key: 'dispose',
                value: function dispose() {
                    this.stop();
                    this.listeners.length = 0;
                }
            }
        ]);
        return HistoryLocator;
    }(_Locator3['default']);
    exports['default'] = HistoryLocator;
    module.exports = exports['default'];
});