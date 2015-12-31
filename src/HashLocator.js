/**
 * @file HashLocator
 * @author leon(ludafa@outlook.com)
 */

const util = require('./util');

const addEventListener = util.addEventListener;
const removeEventListener = util.removeEventListener;
const getHash = util.getHash;
const addQuery = util.addQuery;
const guid = util.guid;

const Locator =  require('./Locator');
const Location =  require('./Location');

const action = require('./action');
const PUSH = action.PUSH;
const REPLACE = action.REPLACE;
const TRAVEL = action.TRAVEL;

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
