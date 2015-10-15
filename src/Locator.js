/**
 * @file History
 * @author leon(ludafa@outlook.com)
 */

let util = require('./util');
let toQueryString = util.toQueryString;
let guid = util.guid;
let addQuery = util.addQuery;

let Location =  require('./Location');

let action = require('./action');
let PUSH = action.PUSH;
let REPLACE = action.REPLACE;
let TRAVEL = action.TRAVEL;

class History {

    constructor() {
        this.onLocationChange = this.onLocationChange.bind(this);
        this.listeners = [];
        this.interceptors = [];
        this.currentLocation = null;
        this.stack = [];
    }

    onLocationChange(e) {
        this.transit(this.getLocation(e));
    }

    getLocation() {
        throw new Error('history.getLocation() need implement');
    }

    start() {
        let nextLocation = this.getLocation();
        this.stack = [nextLocation.id];
        this.transit(nextLocation);
    }

    on(handler) {
        this.listeners.push(handler);
        return this;
    }

    off(handler) {
        this.listeners = this.listeners.filter(function (item) {
            return item !== handler;
        });
        return this;
    }

    redirect(url, query={}, force=false, title='') {
        let nextLocation = new Location(
            addQuery(url, query),
            PUSH,
            guid(),
            title
        );
        this.transit(nextLocation, force);
    }

    replace(url, query={}, force=false, title='') {
        let nextLocation = new Location(
            addQuery(url, query),
            REPLACE,
            guid(),
            title
        );
        this.transit(nextLocation, force);
    }

    reload() {
        this.transit(this.getLocation(), true);
    }

    transit(nextLocation, force) {

        let {currentLocation} = this;

        if (currentLocation && currentLocation.equalTo(nextLocation)) {
            if (force) {
                this.notifyAll(nextLocation);
            }
            return;
        }

        this.intercept(nextLocation, (ok) => {

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

            if (
                currentLocationIndex === -1
                || nextLocationIndex === -1
            ) {
                return;
            }

            // 因为我们在这里直接给滚回去了，
            // 所以会因为上边的currentLocation是一样的，就不会再有后边的操作啦
            // 因此我们也不会触发回调了
            this.go(currentLocationIndex - nextLocationIndex);

            return;

        });

    }

    getLocationIndex(loc) {
        return this.stack.indexOf(loc.id);
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
                this.stack = currentLocationIndex === -1
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

    notifyAll(nextLocation) {
        // 触发回调
        this.listeners.forEach(function (listener) {
            listener(nextLocation);
        });
    }

    getLength() {
        return this.stack.length;
    }

    go(delta) {
        if (delta) {
            window.history.go(delta);
        }
    }

    back() {
        this.go(-1);
    }

    forward() {
        this.go(1);
    }

    createHref(pathname, query) {
        let index = pathname.indexOf('?');
        let connector = index === -1 ? '?' : '&';
        return pathname + connector + toQueryString(query);
    }

    dispose() {
        this.stop();
        this.listeners.length = 0;
    }

    use(interceptor) {
        this.interceptors.push(interceptor);
        return this;
    }

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

    update(nextQuery) {

        let {currentLocation} = this;
        let {pathname, query, title} = currentLocation;

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

}

module.exports = History;
