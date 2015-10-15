/**
 * @file HashLocator
 * @author leon(ludafa@outlook.com)
 */

let util = require('./util');

let addEventListener = util.addEventListener;
let removeEventListener = util.removeEventListener;
let getHash = util.getHash;
let addQuery = util.addQuery;
let guid = util.guid;

let Locator =  require('./Locator');
let Location =  require('./Location');

let action = require('./action');
let PUSH = action.PUSH;
let REPLACE = action.REPLACE;
let TRAVEL = action.TRAVEL;

class HashLocator extends Locator {

    getLocation(e) {

        return new Location(
            getHash(window.location),
            TRAVEL,
            guid(),
            ''
        );

    }

    finishTransit(nextLocation) {

        super.finishTransit(nextLocation);

        let {action} = nextLocation;

        switch (action) {
            case PUSH: case REPLACE:
                window.location.hash = nextLocation.toString();
                return;
        }

    }

    start() {
        super.start();
        addEventListener(window, 'hashchange', this.onLocationChange);
        return this;
    }

    stop() {
        removeEventListener(window, 'hashchange', this.onLocationChange);
        return this;
    }

    createHref(pathname, query) {
        return '#' + addQuery(pathname, query);
    }

}

module.exports = HashLocator;
