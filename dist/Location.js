define('numen/Location', [
    'require',
    'exports',
    'module',
    './babelHelpers',
    './action',
    './util'
], function (require, exports, module) {
    var babelHelpers = require('./babelHelpers');
    var action = require('./action');
    var TRAVEL = action.TRAVEL;
    var util = require('./util');
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