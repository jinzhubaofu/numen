/**
 * @file HashLocator
 * @author leon(ludafa@outlook.com)
 */

import {
    addEventListener,
    removeEventListener,
    getHash,
    addQuery
} from './util';

import Locator from './Locator';
import Location from './Location';
import {PUSH, REPLACE, TRAVEL} from './action';
import {guid} from './util';

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

export default HashLocator;
