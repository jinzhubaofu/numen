(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['module', "./babelHelpers", './Locator', './Location', './util', './action'], factory);
    } else if (typeof exports !== "undefined") {
        factory(module, require("./babelHelpers"), require('./Locator'), require('./Location'), require('./util'), require('./action'));
    } else {
        var mod = {
            exports: {}
        };
        factory(mod, global.babelHelpers, global.Locator, global.Location, global.util, global.action);
        global.HistoryLocator = mod.exports;
    }
})(this, function (module, babelHelpers, Locator, Location, util, action) {
    'use strict';

    var addEventListener = util.addEventListener;
    /**
     * @file HistoryLocator
     * @author leon(ludafa@outlook.com)
     */

    var removeEventListener = util.removeEventListener;
    var guid = util.guid;

    var PUSH = action.PUSH;
    var REPLACE = action.REPLACE;
    var TRAVEL = action.TRAVEL;

    var HISTORY_LOCATOR_STATE_ID_KEY = '__hlik__';

    var HISTORY_API_SUPPORTED = typeof window.history.pushState === 'function';

    var HistoryLocator = function (_Locator) {
        babelHelpers.inherits(HistoryLocator, _Locator);

        function HistoryLocator() {
            babelHelpers.classCallCheck(this, HistoryLocator);
            return babelHelpers.possibleConstructorReturn(this, Object.getPrototypeOf(HistoryLocator).apply(this, arguments));
        }

        babelHelpers.createClass(HistoryLocator, [{
            key: 'start',
            value: function start() {
                babelHelpers.get(Object.getPrototypeOf(HistoryLocator.prototype), 'start', this).call(this);
                addEventListener(window, 'popstate', this.onLocationChange);
                return this;
            }
        }, {
            key: 'stop',
            value: function stop() {
                removeEventListener(window, 'popstate', this.onLocationChange);
                return this;
            }
        }, {
            key: 'getLocation',
            value: function getLocation(e) {

                var state = e && e.state || window.history.state || {};

                var id = state[HISTORY_LOCATOR_STATE_ID_KEY];

                var loc = window.location;

                var pathname = loc.pathname;
                var search = loc.search;
                var hash = loc.hash;

                var path = pathname + search + hash;

                // 实现是这样的：
                // 使用 history api 时，我们会占用 state 中的一项来存储 Location Id
                // 这样我们的 stack 就可以只保存 Locaiton Id 了
                // 原因是这样的：
                // 我们在 TRAVEL 的时候呢，需要找出来 travel target location 在我们 stack 中的位置
                // 比如 A -> B -> C -> D，然后呢，我们现在在 D
                // 那么 go(-2)， 我们应当移动到 B；点一下后退按钮，我们应当移动到 C。
                // 但是 -2 还是 -1 这个事情我们是并不知道的。
                // ## go 也许还行，强制大家用我们的 api；点后退这事儿就不行了（可以默认-1啊。。）
                // 所以呢，我们在 pushState 的时候要把 id 丢到 state 中
                // 不管回退到哪一步，我们只要从 state 里边取出 id，我们就知道现在我们在哪了。
                // 也就是说 A(id:1) -> B(id:2) -> C(id:3) -> D(id:4)
                // 那么我们在处理 TRAVEL 的时候就有 id 可以用啦
                // 但是！第一次启动的时候，我们并没有 state，也就是 A 没有用 id 可用
                // 因此，我们要这么干，在发现没有 id 的时候自动补上
                if (!id) {

                    id = guid();

                    // 如果支持 history api 我们才可以这样搞，要不然就直接挂了
                    if (HISTORY_API_SUPPORTED) {
                        window.history.replaceState(babelHelpers.extends({}, state, babelHelpers.defineProperty({}, HISTORY_LOCATOR_STATE_ID_KEY, id)), null, path);
                    }
                }

                return new Location(path, TRAVEL, id, '');
            }
        }, {
            key: 'finishTransit',
            value: function finishTransit(nextLocation) {
                var action = nextLocation.action;
                var title = nextLocation.title;


                var state = babelHelpers.defineProperty({}, HISTORY_LOCATOR_STATE_ID_KEY, nextLocation.id);

                var nextLocationHref = nextLocation.toString();

                // 如果当前浏览器不支持 history api 我们默认的行为是跳转
                if (!HISTORY_API_SUPPORTED) {
                    window.location = nextLocationHref;
                    return;
                }

                switch (action) {
                    case PUSH:
                        window.history.pushState(state, title, nextLocationHref);
                        break;
                    case REPLACE:
                        window.history.replaceState(state, title, nextLocationHref);
                        break;
                }

                babelHelpers.get(Object.getPrototypeOf(HistoryLocator.prototype), 'finishTransit', this).call(this, nextLocation);
            }
        }, {
            key: 'createHref',
            value: function createHref(nextLocation) {
                return nextLocation ? nextLocation.toString() : 'javascript: void 0';
            }
        }, {
            key: 'dispose',
            value: function dispose() {
                this.stop();
                this.listeners.length = 0;
            }
        }]);
        return HistoryLocator;
    }(Locator);

    module.exports = HistoryLocator;
});