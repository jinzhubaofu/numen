/**
 * @file history/Location
 * @author leon(ludafa@outlook.com)
 */

const action = require('./action');

const TRAVEL = action.TRAVEL;

const util = require('./util');
const parseQueryString = util.parseQueryString;
const normalize = util.normalize;

class Location {

    constructor(href, action=TRAVEL, id=null, title='') {

        href = normalize(href);

        this.href = href;
        this.title = title;
        this.action = action;
        this.id = id;

        // 保证href是以 / 开头的，并不接受相对路径。。。
        href = this.href = (href.indexOf('/') === 0 ? '' : '/') + href;

        let hashIndex = href.indexOf('#');
        if (hashIndex !== -1) {
            this.hash = href.slice(hashIndex);
            href = href.slice(0, hashIndex);
        }
        else {
            this.hash = '';
        }

        let searchIndex = href.indexOf('?');
        if (searchIndex !== -1) {
            let search = this.search = href.slice(searchIndex);
            let querystring = this.querystring = search.slice(1);
            this.query = querystring ? parseQueryString(querystring) : {};
            href = href.slice(0, searchIndex);
        }
        else {
            this.search = '';
        }

        this.pathname = href;

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
