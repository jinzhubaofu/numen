/**
 * @file history/Location
 * @author leon(ludafa@outlook.com)
 */

const action = require('./action');

const TRAVEL = action.TRAVEL;

const util = require('./util');
const normalize = util.normalize;

class Location {

    constructor(href, action=TRAVEL, id=null, title='') {

        this.title = title;
        this.action = action;
        this.id = id;

        Object.assign(this, util.pasreHref(normalize(href)));

    }

    toString() {
        return `${this.pathname || ''}${this.search || ''}`;
    }

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
