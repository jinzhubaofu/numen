/**
 * @file HashLocator
 * @author leon(ludafa@outlook.com)
 */

const {
    addEventListener,
    removeEventListener,
    getHash,
    addQuery,
    guid
} = require('./util');

const Locator =  require('./Locator');
const Location =  require('./Location');

const {
    PUSH,
    REPLACE,
    TRAVEL
} = require('./action');

/**
 * 基于 Hash 的定位器
 *
 * @extends Locator
 */
class HashLocator extends Locator {

    /**
     * 解析当前地址
     *
     * @protected
     * @override
     */
    getLocation(e) {

        return new Location(
            getHash(window.location),
            TRAVEL,
            guid(),
            ''
        );

    }

    /**
     * 完成转换
     *
     * @protected
     * @param {Location} nextLocation 下一下地址
     */
    finishTransit(nextLocation) {

        super.finishTransit(nextLocation);

        switch (nextLocation.action) {
            case PUSH: case REPLACE:
                window.location.hash = nextLocation.toString();
                return;
        }

    }

    /**
     * 开始监听
     *
     * @public
     * @override
     */
    start() {
        super.start();
        addEventListener(window, 'hashchange', this.onLocationChange);
        return this;
    }

    /**
     * 停止监听
     *
     * @public
     * @override
     */
    stop() {
        removeEventListener(window, 'hashchange', this.onLocationChange);
        return this;
    }

    /**
     * 生成 href 地址
     *
     * @public
     * @param {string}  pathname pathname
     * @param {?Object} query    query
     * @return {string}
     */
    createHref(pathname, query) {
        return '#' + addQuery(pathname, query);
    }

}

module.exports = HashLocator;
