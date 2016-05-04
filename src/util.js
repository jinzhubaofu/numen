/**
 * @file util
 * @author leon(ludafa@outlook.com)
 */

exports.addEventListener = function addEventListener(target, eventName, handler) {

    if (target.addEventListener) {
        target.addEventListener(eventName, handler);
        return;
    }

    target.attachEvent('on' + eventName, handler);

};

exports.removeEventListener = function removeEventListener(target, eventName, handler) {

    if (target.removeEventListener) {
        target.removeEventListener(eventName, handler);
        return;
    }

    target.detachEvent('on' + eventName, handler);
};

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

exports.addQuery = function addQuery(path, query) {

    const location = pasreHref(path);

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

exports.guid = function guid(length = 8) {
    return Math.random().toString(36).substr(2, length);
};

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

exports.getHash = function getHash(target) {
    let href = target.href;
    let index = href.indexOf('#');
    return index === -1 ? '' : href.slice(index + 1);
};

const HTTP_PREFIX_REGEXP = /^(https?:\/\/[^\/]*)/;

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

