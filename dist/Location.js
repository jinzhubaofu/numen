var babelHelpers = require("./babelHelpers");
(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['module', './action', './util'], factory);
    } else if (typeof exports !== "undefined") {
        factory(module, require('./action'), require('./util'));
    } else {
        var mod = {
            exports: {}
        };
        factory(mod, global.action, global.util);
        global.Location = mod.exports;
    }
})(this, function (module, action, util) {
    'use strict';

    var TRAVEL = action.TRAVEL; /**
                                 * @file history/Location
                                 * @author leon(ludafa@outlook.com)
                                 */

    var normalize = util.normalize;

    var Location = function () {
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

        babelHelpers.createClass(Location, [{
            key: 'toString',
            value: function toString() {
                return '' + (this.pathname || '') + (this.search || '');
            }
        }, {
            key: 'equalTo',
            value: function equalTo(anotherLocation) {
                var pathname = this.pathname;
                var search = this.search;


                if (this === anotherLocation) {
                    return true;
                }

                return pathname === anotherLocation.pathname && search === anotherLocation.search;
            }
        }]);
        return Location;
    }();

    module.exports = Location;
});