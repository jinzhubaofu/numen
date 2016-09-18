(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['module', './babelHelpers', './action', './util'], factory);
    } else if (typeof exports !== "undefined") {
        factory(module, require('./babelHelpers'), require('./action'), require('./util'));
    } else {
        var mod = {
            exports: {}
        };
        factory(mod, global.babelHelpers, global.action, global.util);
        global.Location = mod.exports;
    }
})(this, function (module, babelHelpers, action, util) {
    'use strict';

    var TRAVEL = action.TRAVEL; /**
                                 * @file history/Location
                                 * @author leon(ludafa@outlook.com)
                                 */

    var normalize = util.normalize;

    var Location = function () {

        /**
         * 构造函数
         *
         * @public
         * @param {string}  href   href
         * @param {?string} action action
         * @param {?string} id     id
         * @param {?title}  title  title
         */
        function Location(href) {
            var action = arguments.length <= 1 || arguments[1] === undefined ? TRAVEL : arguments[1];
            var id = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];
            var title = arguments.length <= 3 || arguments[3] === undefined ? '' : arguments[3];
            babelHelpers.classCallCheck(this, Location);


            this.title = title;
            this.action = action;
            this.id = id;

            Object.assign(this, util.pasreHref(normalize(href)));
        }

        /**
         * toString
         *
         * @public
         * @return {string}
         */


        Location.prototype.toString = function toString() {
            return '' + (this.pathname || '') + (this.search || '');
        };

        Location.prototype.equalTo = function equalTo(anotherLocation) {
            var pathname = this.pathname;
            var search = this.search;


            if (this === anotherLocation) {
                return true;
            }

            return pathname === anotherLocation.pathname && search === anotherLocation.search;
        };

        return Location;
    }();

    module.exports = Location;
});
//# sourceMappingURL=Location.js.map
