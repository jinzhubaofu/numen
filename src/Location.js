/**
 * @file history/Location
 * @author leon(ludafa@outlook.com)
 */

const action = require('./action');

const TRAVEL = action.TRAVEL;

const util = require('./util');
const normalize = util.normalize;

class Location {

    /**
     * 构造函数
     *
     * @public
     * @param {string}  href   href
     * @param {?string} action action
     * @param {?string} id     id
     * @param {?title}  title  title
     */
    constructor(href, action = TRAVEL, id = null, title = '') {

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
    toString() {
        return `${this.pathname || ''}${this.search || ''}`;
    }

    /**
     * 是否相等
     *
     * @public
     * @param {module:Locaiton} anotherLocation 另一个 location
     * @return {boolean}
     */
    equalTo(anotherLocation) {

        let {pathname, search} = this;

        if (this === anotherLocation) {
            return true;
        }

        return pathname === anotherLocation.pathname
            && search === anotherLocation.search;

    }

}

module.exports = Location;
