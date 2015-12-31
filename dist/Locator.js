define('numen/Locator', [
    'require',
    'exports',
    'module',
    './babelHelpers',
    './util',
    './Location',
    './action'
], function (require, exports, module) {
    var babelHelpers = require('./babelHelpers');
    var util = require('./util');
    var toQueryString = util.toQueryString;
    var guid = util.guid;
    var addQuery = util.addQuery;
    var Location = require('./Location');
    var action = require('./action');
    var PUSH = action.PUSH;
    var REPLACE = action.REPLACE;
    var TRAVEL = action.TRAVEL;
    var History = function () {
        function History() {
            babelHelpers.classCallCheck(this, History);
            this.onLocationChange = this.onLocationChange.bind(this);
            this.listeners = [];
            this.interceptors = [];
            this.currentLocation = null;
            this.stack = [];
        }
        History.prototype.onLocationChange = function onLocationChange(e) {
            this.transit(this.getLocation(e));
        };
        History.prototype.getLocation = function getLocation() {
            throw new Error('history.getLocation() need implement');
        };
        History.prototype.start = function start() {
            var nextLocation = this.getLocation();
            this.stack = [nextLocation.id];
            this.transit(nextLocation);
        };
        History.prototype.on = function on(handler) {
            this.listeners.push(handler);
            return this;
        };
        History.prototype.off = function off(handler) {
            this.listeners = this.listeners.filter(function (item) {
                return item !== handler;
            });
            return this;
        };
        History.prototype.redirect = function redirect(url) {
            var query = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
            var force = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];
            var title = arguments.length <= 3 || arguments[3] === undefined ? '' : arguments[3];
            var nextLocation = new Location(addQuery(url, query), PUSH, guid(), title);
            this.transit(nextLocation, force);
        };
        History.prototype.replace = function replace(url) {
            var query = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
            var force = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];
            var title = arguments.length <= 3 || arguments[3] === undefined ? '' : arguments[3];
            var nextLocation = new Location(addQuery(url, query), REPLACE, guid(), title);
            this.transit(nextLocation, force);
        };
        History.prototype.reload = function reload() {
            this.transit(this.getLocation(), true);
        };
        History.prototype.transit = function transit(nextLocation, force) {
            var _this = this;
            var currentLocation = this.currentLocation;
            if (currentLocation && currentLocation.equalTo(nextLocation)) {
                if (force) {
                    this.notifyAll(nextLocation);
                }
                return;
            }
            this.intercept(nextLocation, function (ok) {
                if (ok) {
                    _this.finishTransit(nextLocation);
                    return;
                }
                if (nextLocation.action !== TRAVEL) {
                    return;
                }
                var currentLocationIndex = currentLocation ? _this.getLocationIndex(currentLocation) : -1;
                var nextLocationIndex = _this.getLocationIndex(nextLocation);
                if (currentLocationIndex === -1 || nextLocationIndex === -1) {
                    return;
                }
                _this.go(currentLocationIndex - nextLocationIndex);
                return;
            });
        };
        History.prototype.getLocationIndex = function getLocationIndex(loc) {
            return this.stack.indexOf(loc.id);
        };
        History.prototype.finishTransit = function finishTransit(nextLocation) {
            var currentLocation = this.currentLocation;
            var stack = this.stack;
            var action = nextLocation.action;
            var id = nextLocation.id;
            var currentLocationIndex = currentLocation ? this.getLocationIndex(currentLocation) : -1;
            switch (action) {
            case PUSH:
                this.stack = currentLocationIndex === -1 ? [id] : stack.slice(0, currentLocationIndex + 1).concat(id);
                break;
            case REPLACE:
                if (currentLocationIndex !== -1) {
                    this.stack[currentLocationIndex] = id;
                }
                break;
            }
            this.notifyAll(nextLocation);
            this.currentLocation = nextLocation;
        };
        History.prototype.notifyAll = function notifyAll(nextLocation) {
            this.listeners.forEach(function (listener) {
                listener(nextLocation);
            });
        };
        History.prototype.getLength = function getLength() {
            return this.stack.length;
        };
        History.prototype.go = function go(delta) {
            if (delta) {
                window.history.go(delta);
            }
        };
        History.prototype.back = function back() {
            this.go(-1);
        };
        History.prototype.forward = function forward() {
            this.go(1);
        };
        History.prototype.createHref = function createHref(pathname, query) {
            var index = pathname.indexOf('?');
            var connector = index === -1 ? '?' : '&';
            return pathname + connector + toQueryString(query);
        };
        History.prototype.dispose = function dispose() {
            this.stop();
            this.listeners.length = 0;
        };
        History.prototype.use = function use(interceptor) {
            this.interceptors.push(interceptor);
            return this;
        };
        History.prototype.intercept = function intercept(nextLocation, callback) {
            var current = 0;
            var isDone = false;
            var interceptors = this.interceptors.slice();
            function done(ok) {
                isDone = true;
                callback(ok);
            }
            function next() {
                if (isDone || current === interceptors.length) {
                    isDone = true;
                    callback(true);
                    return;
                }
                var interceptor = interceptors[current++];
                interceptor(nextLocation, next, done);
            }
            next();
            return this;
        };
        History.prototype.update = function update(nextQuery) {
            var currentLocation = this.currentLocation;
            var pathname = currentLocation.pathname;
            var query = currentLocation.query;
            var title = currentLocation.title;
            this.redirect(pathname, babelHelpers._extends({}, query, nextQuery), false, title);
        };
        return History;
    }();
    module.exports = History;
});