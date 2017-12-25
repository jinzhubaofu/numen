/**
 * @file Locator
 * @author leon(ludafa@outlook.com)
 */

const Location = require('./Location');

const {toQueryString, guid, addQuery, isAbsolute} = require('./util');

const {PUSH, REPLACE, TRAVEL} = require('./action');

/**
 * 定位器
 *
 * @abstract
 */
class Locator {
    /**
     * 构造函数
     *
     * @public
     */
    constructor() {
        this.onLocationChange = this.onLocationChange.bind(this);
        this.listeners = [];
        this.interceptors = [];
        this.currentLocation = null;
        this.stack = [];
    }

    /**
     * 地址发生变化时处理函数
     *
     * @param {Object} e 地址变化事件
     * @protected
     */
    onLocationChange(e) {
        this.transit(this.getLocation(e));
    }

    /**
     * 获取当前地址
     *
     * @abstract
     * @return {Location}
     */
    getLocation() {
        throw new Error('history.getLocation() need implement');
    }

    /**
     * 开始监听
     *
     * @public
     */
    start() {
        let nextLocation = this.getLocation();
        this.stack = [nextLocation.id];
        this.transit(nextLocation);
    }

    /**
     * 添加事件监听
     *
     * @public
     * @param {Function} handler 回调函数
     * @return {Locator}
     */
    on(handler) {
        this.listeners.push(handler);
        return this;
    }

    /**
     * 移除事件监听
     *
     * @public
     * @param {Function} handler 回调函数
     * @return {Locator}
     */
    off(handler) {
        this.listeners = this.listeners.filter(function(item) {
            return item !== handler;
        });
        return this;
    }

    /**
     * 跳转
     *
     * @public
     * @param {string}   url   url
     * @param {?Object}  query query
     * @param {?boolean} force 强制跳转（即使当前 Location 与即将转向的 Location 一致仍触发 change 事件）
     * @param {?string}  title 标题
     */
    redirect(url, query = {}, force = false, title = '') {
        if (isAbsolute(url)) {
            window.location = url;
            return;
        }
        let nextLocation = new Location(
            addQuery(url, query),
            PUSH,
            guid(),
            title
        );
        this.transit(nextLocation, force);
    }

    /**
     * 替换当前地址
     *
     * @public
     * @param {string}   url   url
     * @param {?Object}  query query
     * @param {?boolean} force 强制跳转（即使当前 Location 与即将转向的 Location 一致仍触发 change 事件）
     * @param {?string}  title 标题
     */
    replace(url, query = {}, force = false, title = '') {
        if (isAbsolute(url)) {
            window.location = url;
            return;
        }
        let nextLocation = new Location(
            addQuery(url, query),
            REPLACE,
            guid(),
            title
        );
        this.transit(nextLocation, force);
    }

    /**
     * 重载
     *
     * @public
     */
    reload() {
        this.transit(this.getLocation(), true);
    }

    /**
     * 转向
     *
     * @param {Location} nextLocation 下一下地址
     * @param {boolean}  force        强制转转
     */
    transit(nextLocation, force) {
        let currentLocation = this.currentLocation;

        if (currentLocation && currentLocation.equalTo(nextLocation)) {
            if (force) {
                this.notifyAll(nextLocation);
            }
            return;
        }

        this.intercept(nextLocation, ok => {
            // 如果跳转没有被拦截，那么我们就完成之
            if (ok) {
                this.finishTransit(nextLocation);
                return;
            }

            // 如果被跳转被挡截下来，那么我们就要滚回去
            // 这里处理TRAVEL类型，原因是如果是PUSH/REPLACE，我们在这里并不会调用`finisihTransit`了，也就没有效果
            if (nextLocation.action !== TRAVEL) {
                return;
            }

            // 接下来我们要计算滚回几步
            // 计算的办法是这样的：
            // 首先找到当前的地址序号，再找到一下地址的序号
            // 对于 TRAVEL back 操作来讲，比如 1 -> 2 -> 3
            // 然后在back操作会导致3状态(currentLocation)回到2状态(nextLocation)
            // 下一个地址有可能已经在我们的栈中了。
            // 因此，在这种情况下 nextLocationIndex 是小于 currentLocationIndex的
            // 那么两者的差值就是我们需要回滚的步数。

            let currentLocationIndex = currentLocation
                ? this.getLocationIndex(currentLocation)
                : -1;

            // 接下来找到下一个地址在栈中的位置

            let nextLocationIndex = this.getLocationIndex(nextLocation);

            if (currentLocationIndex === -1 || nextLocationIndex === -1) {
                return;
            }

            // 因为我们在这里直接给滚回去了，
            // 所以会因为上边的currentLocation是一样的，就不会再有后边的操作啦
            // 因此我们也不会触发回调了
            this.go(currentLocationIndex - nextLocationIndex);

            return;
        });
    }

    /**
     * 获取地地址在历史栈中的序号
     *
     * @protected
     * @param {Location} location 地址
     * @return {number}
     */
    getLocationIndex(location) {
        return this.stack.indexOf(location.id);
    }

    /**
     * 更新当前的URL
     *
     * 基类中的此接口有两个功能
     *
     * 1. 更新历史记录栈
     * 2. 触发侦听函数
     * 3. 更新当前地址
     *
     * @param {module:Location} nextLocation 下一个location
     */
    finishTransit(nextLocation) {
        let {currentLocation, stack} = this;

        let {action, id} = nextLocation;

        let currentLocationIndex = currentLocation
            ? this.getLocationIndex(currentLocation)
            : -1;

        // 这里只处理`产生`历史记录的操作(PUSH/REPLACE)，TRAVEL对应的是回退/前进，并不影响栈
        switch (action) {
            case PUSH:
                this.stack =
                    currentLocationIndex === -1
                        ? [id]
                        : stack.slice(0, currentLocationIndex + 1).concat(id);
                break;
            case REPLACE:
                if (currentLocationIndex !== -1) {
                    this.stack[currentLocationIndex] = id;
                }
                break;
        }

        this.notifyAll(nextLocation);

        this.currentLocation = nextLocation;
    }

    /**
     * 触发回调
     *
     * @protected
     * @param {module:Location} nextLocation 下一个地址
     */
    notifyAll(nextLocation) {
        // 触发回调
        this.listeners.forEach(function(listener) {
            listener(nextLocation);
        });
    }

    /**
     * 获取历史栈的长度
     *
     * @return {number}
     */
    getLength() {
        return this.stack.length;
    }

    /**
     * 前向/前后指定步数
     *
     * 基本等同于 window.location.go
     *
     * @public
     * @param {number} delta 步数
     */
    go(delta) {
        if (delta) {
            window.history.go(delta);
        }
    }

    /**
     * 回退
     *
     * @public
     */
    back() {
        this.go(-1);
    }

    /**
     * 前进
     *
     * @public
     */
    forward() {
        this.go(1);
    }

    /**
     * 生成 href
     *
     * @public
     * @param {string}  pathname pathname
     * @param {?Object} query    query
     * @return {string}
     */
    createHref(pathname, query) {
        let index = pathname.indexOf('?');
        let connector = index === -1 ? '?' : '&';
        return pathname + connector + toQueryString(query);
    }

    /**
     * 添加拦截器
     *
     * @public
     * @param {Function} interceptor 拦截器
     * @return {module:Locator}
     */
    use(interceptor) {
        this.interceptors.push(interceptor);
        return this;
    }

    /**
     * 拦截
     *
     * 按照用户指定的拦截器栈的顺序，依次调用拦截器；
     *
     * @protected
     * @param  {module:Location} nextLocation 下一个地址
     * @param  {Function}        callback     完成时回调函数
     * @return {module:Locator}
     */
    intercept(nextLocation, callback) {
        let current = 0;
        let isDone = false;
        let interceptors = this.interceptors.slice();

        function done(ok) {
            isDone = true;
            callback(ok);
        }

        function next() {
            if (isDone || current === interceptors.length) {
                isDone = true;
                callback(true);
                return;
            }

            let interceptor = interceptors[current++];
            interceptor(nextLocation, next, done);
        }

        next();

        return this;
    }

    /**
     * 按指定的 query 生成一个新的 href，并跳转到新 href
     *
     * @public
     * @param {Object} nextQuery 合并的 query
     */
    update(nextQuery) {
        let {pathname, query, title} = this.currentLocation;

        this.redirect(
            pathname,
            {
                ...query,
                ...nextQuery
            },
            false,
            title
        );
    }

    /**
     * 析构
     *
     * @public
     */
    dispose() {
        this.stop();
        this.listeners.length = 0;
    }
}

module.exports = Locator;
