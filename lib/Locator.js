(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['module', './babelHelpers', './Location', './util', './action'], factory);
    } else if (typeof exports !== "undefined") {
        factory(module, require('./babelHelpers'), require('./Location'), require('./util'), require('./action'));
    } else {
        var mod = {
            exports: {}
        };
        factory(mod, global.babelHelpers, global.Location, global.util, global.action);
        global.Locator = mod.exports;
    }
})(this, function (module, babelHelpers, Location, _require, _require2) {
    'use strict';

    var toQueryString = _require.toQueryString;
    var guid = _require.guid;
    var addQuery = _require.addQuery;
    var PUSH = _require2.PUSH;
    var REPLACE = _require2.REPLACE;
    var TRAVEL = _require2.TRAVEL;

    var Locator = function () {

        /**
         * 构造函数
         *
         * @public
         */
        function Locator() {
            babelHelpers.classCallCheck(this, Locator);

            this.onLocationChange = this.onLocationChange.bind(this);
            this.listeners = [];
            this.interceptors = [];
            this.currentLocation = null;
            this.stack = [];
        }

        /**
         * 地址发生变化时处理函数
         *
         * @param {Object} e 地址变化事件
         * @protected
         */


        Locator.prototype.onLocationChange = function onLocationChange(e) {
            this.transit(this.getLocation(e));
        };

        Locator.prototype.getLocation = function getLocation() {
            throw new Error('history.getLocation() need implement');
        };

        Locator.prototype.start = function start() {
            var nextLocation = this.getLocation();
            this.stack = [nextLocation.id];
            this.transit(nextLocation);
        };

        Locator.prototype.on = function on(handler) {
            this.listeners.push(handler);
            return this;
        };

        Locator.prototype.off = function off(handler) {
            this.listeners = this.listeners.filter(function (item) {
                return item !== handler;
            });
            return this;
        };

        Locator.prototype.redirect = function redirect(url) {
            var query = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
            var force = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];
            var title = arguments.length <= 3 || arguments[3] === undefined ? '' : arguments[3];

            var nextLocation = new Location(addQuery(url, query), PUSH, guid(), title);
            this.transit(nextLocation, force);
        };

        Locator.prototype.replace = function replace(url) {
            var query = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
            var force = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];
            var title = arguments.length <= 3 || arguments[3] === undefined ? '' : arguments[3];

            var nextLocation = new Location(addQuery(url, query), REPLACE, guid(), title);
            this.transit(nextLocation, force);
        };

        Locator.prototype.reload = function reload() {
            this.transit(this.getLocation(), true);
        };

        Locator.prototype.transit = function transit(nextLocation, force) {
            var _this = this;

            var currentLocation = this.currentLocation;

            if (currentLocation && currentLocation.equalTo(nextLocation)) {
                if (force) {
                    this.notifyAll(nextLocation);
                }
                return;
            }

            this.intercept(nextLocation, function (ok) {

                // 如果跳转没有被拦截，那么我们就完成之
                if (ok) {
                    _this.finishTransit(nextLocation);
                    return;
                }

                // 如果被跳转被挡截下来，那么我们就要滚回去
                // 这里处理TRAVEL类型，原因是如果是PUSH/REPLACE，我们在这里并不会调用`finisihTransit`了，也就没有效果
                if (nextLocation.action !== TRAVEL) {
                    return;
                }

                // 接下来我们要计算滚回几步
                // 计算的办法是这样的：
                // 首先找到当前的地址序号，再找到一下地址的序号
                // 对于 TRAVEL back 操作来讲，比如 1 -> 2 -> 3
                // 然后在back操作会导致3状态(currentLocation)回到2状态(nextLocation)
                // 下一个地址有可能已经在我们的栈中了。
                // 因此，在这种情况下 nextLocationIndex 是小于 currentLocationIndex的
                // 那么两者的差值就是我们需要回滚的步数。

                var currentLocationIndex = currentLocation ? _this.getLocationIndex(currentLocation) : -1;

                // 接下来找到下一个地址在栈中的位置

                var nextLocationIndex = _this.getLocationIndex(nextLocation);

                if (currentLocationIndex === -1 || nextLocationIndex === -1) {
                    return;
                }

                // 因为我们在这里直接给滚回去了，
                // 所以会因为上边的currentLocation是一样的，就不会再有后边的操作啦
                // 因此我们也不会触发回调了
                _this.go(currentLocationIndex - nextLocationIndex);

                return;
            });
        };

        Locator.prototype.getLocationIndex = function getLocationIndex(location) {
            return this.stack.indexOf(location.id);
        };

        Locator.prototype.finishTransit = function finishTransit(nextLocation) {
            var currentLocation = this.currentLocation;
            var stack = this.stack;
            var action = nextLocation.action;
            var id = nextLocation.id;


            var currentLocationIndex = currentLocation ? this.getLocationIndex(currentLocation) : -1;

            // 这里只处理`产生`历史记录的操作(PUSH/REPLACE)，TRAVEL对应的是回退/前进，并不影响栈
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

        Locator.prototype.notifyAll = function notifyAll(nextLocation) {
            // 触发回调
            this.listeners.forEach(function (listener) {
                listener(nextLocation);
            });
        };

        Locator.prototype.getLength = function getLength() {
            return this.stack.length;
        };

        Locator.prototype.go = function go(delta) {
            if (delta) {
                window.history.go(delta);
            }
        };

        Locator.prototype.back = function back() {
            this.go(-1);
        };

        Locator.prototype.forward = function forward() {
            this.go(1);
        };

        Locator.prototype.createHref = function createHref(pathname, query) {
            var index = pathname.indexOf('?');
            var connector = index === -1 ? '?' : '&';
            return pathname + connector + toQueryString(query);
        };

        Locator.prototype.use = function use(interceptor) {
            this.interceptors.push(interceptor);
            return this;
        };

        Locator.prototype.intercept = function intercept(nextLocation, callback) {

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

        Locator.prototype.update = function update(nextQuery) {
            var _currentLocation = this.currentLocation;
            var pathname = _currentLocation.pathname;
            var query = _currentLocation.query;
            var title = _currentLocation.title;


            this.redirect(pathname, babelHelpers['extends']({}, query, nextQuery), false, title);
        };

        Locator.prototype.dispose = function dispose() {
            this.stop();
            this.listeners.length = 0;
        };

        return Locator;
    }();

    module.exports = Locator;
});
//# sourceMappingURL=Locator.js.map
