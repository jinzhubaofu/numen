/**
 * @file util
 * @author leon(ludafa@outlook.com)
 */

/**
 * 添加事件监听
 *
 * @param {Element} target    目标
 * @param {string} eventName 事件名
 * @param {Function} handler   回调函数
 */
exports.addEventListener = function addEventListener(target, eventName, handler) {

    if (target.addEventListener) {
        target.addEventListener(eventName, handler);
        return;
    }

    target.attachEvent('on' + eventName, handler);

};

/**
 * 移除事件监听
 *
 * @param {Element} target    目标
 * @param {string} eventName 事件名
 * @param {Function} handler   回调函数
 */
exports.removeEventListener = function removeEventListener(target, eventName, handler) {

    if (target.removeEventListener) {
        target.removeEventListener(eventName, handler);
        return;
    }

    target.detachEvent('on' + eventName, handler);
};

/**
 * 把一个 Object 转化为 querystring
 *
 * @param  {Object} query query
 * @return {string}
 */
function toQueryString(query) {

    if (!query) {
        return '';
    }

    return Object
        .keys(query)
        // 打平结构
        .reduce(function (items, name) {

            const value = query[name];
            const item = Array.isArray(value)
                ? value.map(function (v) {
                    return {
                        name,
                        value: v
                    };
                })
                : {name, value};

            return items.concat(item);

        }, [])
        // 过滤掉无效项
        .reduce(function (result, {name, value}) {
            if (value != null) {
                result.push(`${encodeURIComponent(name)}=${encodeURIComponent(value)}`);
            }
            return result;
        }, [])
        // 拼接在一起
        .join('&');

}

exports.toQueryString = toQueryString;

/**
 * 解析 href
 *
 * @param  {string} href href
 * @return {Object}
 */
function pasreHref(href) {

    // 保证href是以 / 开头的，并不接受相对路径。。。
    href = (href.indexOf('/') === 0 ? '' : '/') + href;

    let originHref = href;
    let hashIndex = href.indexOf('#');
    let hash = '';

    if (hashIndex !== -1) {
        hash = href.slice(hashIndex);
        href = href.slice(0, hashIndex);
    }

    let searchIndex = href.indexOf('?');
    let search = '';
    let querystring = '';
    let query = {};

    if (searchIndex !== -1) {
        search = href.slice(searchIndex);
        querystring = search.slice(1);
        query = querystring ? parseQueryString(querystring) : {};
        href = href.slice(0, searchIndex);
    }

    let pathname = href;

    return {
        href: originHref,
        pathname, search, hash, query, querystring
    };

}

exports.pasreHref = pasreHref;

/**
 * 在一个 href 上添加额外的 query 参数
 *
 * @param {string} href  href
 * @param {Object} query query
 * @return {string}
 */
exports.addQuery = function addQuery(href, query) {

    const location = pasreHref(href);

    const nextQuery = Object
        .keys(query)
        .reduce(
            function (currentQuery, key) {

                const value = query[key];
                const currentQueryValue = currentQuery[key];

                if (Array.isArray(currentQueryValue)) {
                    currentQuery[key] = currentQueryValue.concat(value);
                }
                else if (currentQuery[key] != null) {
                    currentQuery[key] = [currentQueryValue].concat(value);
                }
                else {
                    currentQuery[key] = value;
                }

                return currentQuery;

            },
            location.query
        );

    const nextQuerystring = toQueryString(nextQuery);

    return nextQuerystring
        ? `${location.pathname}?${nextQuerystring}`
        : location.pathname;

};

/**
 * 随机的唯一id
 *
 * @param  {number} length 长度
 * @return {string}
 */
exports.guid = function guid(length = 8) {
    return Math.random().toString(36).substr(2, length);
};

/**
 * 解析 querystring
 *
 * @param  {string} querystring querystring
 * @return {Object}
 */
function parseQueryString(querystring) {

    if (!querystring) {
        return {};
    }

    return querystring
        .split('&')
        .reduce(function (query, term) {

            const index = term.indexOf('=');

            let name = decodeURIComponent(term.slice(0, index));
            let value = decodeURIComponent(term.slice(index + 1));

            if (!name) {
                return query;
            }

            let currentValue = query[name];

            if (Array.isArray(currentValue)) {
                currentValue.push(value);
            }
            else if (currentValue) {
                query[name] = [currentValue, value];
            }
            else {
                query[name] = value;
            }

            return query;

        }, {});

}

exports.parseQueryString = parseQueryString;

/**
 * 获取当前 href 中的 hash
 *
 * @param  {module:Location} location 目标
 * @return {string}
 */
exports.getHash = function getHash(location) {
    let href = location.href;
    let index = href.indexOf('#');
    return index === -1 ? '' : href.slice(index + 1);
};

const HTTP_PREFIX_REGEXP = /^(https?:\/\/[^\/]*)/;

/**
 * 规范化 href
 *
 * 去掉 protocol://host:port 部分，并且保证 pathname 部分至少有一个 '/'
 *
 * @param  {string} path path
 * @return {string}
 */
exports.normalize = function normalize(path) {

    let match = HTTP_PREFIX_REGEXP.exec(path);

    if (match) {
        path = path.slice(match[1].length);
    }

    if (path.charAt(0) !== '/') {
        path = '/' + path;
    }

    return path;

};
