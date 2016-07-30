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
})(this, function (module, _babelHelpers, action, util) {
    'use strict';

    var _babelHelpers2 = _babelHelpers2.default.interopRequireDefault(_babelHelpers);

    var TRAVEL = action.TRAVEL;

    var normalize = util.normalize;

    var Location = function () {
        function Location(href) {
            var action = arguments.length <= 1 || arguments[1] === undefined ? TRAVEL : arguments[1];
            var id = arguments.length <= 2 || arguments[2] === undefined ? null : arguments[2];
            var title = arguments.length <= 3 || arguments[3] === undefined ? '' : arguments[3];

            _babelHelpers2.default.classCallCheck(this, Location);

            this.title = title;
            this.action = action;
            this.id = id;

            Object.assign(this, util.pasreHref(normalize(href)));
        }

        _babelHelpers2.default.createClass(Location, [{
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