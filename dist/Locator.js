var babelHelpers = require("./babelHelpers");
(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['module', './util', './Location', './action'], factory);
    } else if (typeof exports !== "undefined") {
        factory(module, require('./util'), require('./Location'), require('./action'));
    } else {
        var mod = {
            exports: {}
        };
        factory(mod, global.util, global.Location, global.action);
        global.Locator = mod.exports;
    }
})(this, function (module, util, Location, action) {
    'use strict';

    var toQueryString = util.toQueryString; /**
                                             * @file History
                                             * @author leon(ludafa@outlook.com)
                                             */

    var guid = util.guid;
    var addQuery = util.addQuery;

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

        babelHelpers.createClass(History, [{
            key: 'onLocationChange',
            value: function onLocationChange(e) {
                this.transit(this.getLocation(e));
            }
        }, {
            key: 'getLocation',
            value: function getLocation() {
                throw new Error('history.getLocation() need implement');
            }
        }, {
            key: 'start',
            value: function start() {
                var nextLocation = this.getLocation();
                this.stack = [nextLocation.id];
                this.transit(nextLocation);
            }
        }, {
            key: 'on',
            value: function on(handler) {
                this.listeners.push(handler);
                return this;
            }
        }, {
            key: 'off',
            value: function off(handler) {
                this.listeners = this.listeners.filter(function (item) {
                    return item !== handler;
                });
                return this;
            }
        }, {
            key: 'redirect',
            value: function redirect(url) {
                var query = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
                var force = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];
                var title = arguments.length <= 3 || arguments[3] === undefined ? '' : arguments[3];

                var nextLocation = new Location(addQuery(url, query), PUSH, guid(), title);
                this.transit(nextLocation, force);
            }
        }, {
            key: 'replace',
            value: function replace(url) {
                var query = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
                var force = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];
                var title = arguments.length <= 3 || arguments[3] === undefined ? '' : arguments[3];

                var nextLocation = new Location(addQuery(url, query), REPLACE, guid(), title);
                this.transit(nextLocation, force);
            }
        }, {
            key: 'reload',
            value: function reload() {
                this.transit(this.getLocation(), true);
            }
        }, {
            key: 'transit',
            value: function transit(nextLocation, force) {
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
            }
        }, {
            key: 'getLocationIndex',
            value: function getLocationIndex(loc) {
                return this.stack.indexOf(loc.id);
            }
        }, {
            key: 'finishTransit',
            value: function finishTransit(nextLocation) {
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
            }
        }, {
            key: 'notifyAll',
            value: function notifyAll(nextLocation) {
                // 触发回调
                this.listeners.forEach(function (listener) {
                    listener(nextLocation);
                });
            }
        }, {
            key: 'getLength',
            value: function getLength() {
                return this.stack.length;
            }
        }, {
            key: 'go',
            value: function go(delta) {
                if (delta) {
                    window.history.go(delta);
                }
            }
        }, {
            key: 'back',
            value: function back() {
                this.go(-1);
            }
        }, {
            key: 'forward',
            value: function forward() {
                this.go(1);
            }
        }, {
            key: 'createHref',
            value: function createHref(pathname, query) {
                var index = pathname.indexOf('?');
                var connector = index === -1 ? '?' : '&';
                return pathname + connector + toQueryString(query);
            }
        }, {
            key: 'dispose',
            value: function dispose() {
                this.stop();
                this.listeners.length = 0;
            }
        }, {
            key: 'use',
            value: function use(interceptor) {
                this.interceptors.push(interceptor);
                return this;
            }
        }, {
            key: 'intercept',
            value: function intercept(nextLocation, callback) {

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
            }
        }, {
            key: 'update',
            value: function update(nextQuery) {
                var currentLocation = this.currentLocation;
                var pathname = currentLocation.pathname;
                var query = currentLocation.query;
                var title = currentLocation.title;


                this.redirect(pathname, babelHelpers.extends({}, query, nextQuery), false, title);
            }
        }]);
        return History;
    }();

    module.exports = History;
});