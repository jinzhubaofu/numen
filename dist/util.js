(function (global, factory) {
    if (typeof define === "function" && define.amd) {
        define(['exports', "./babelHelpers"], factory);
    } else if (typeof exports !== "undefined") {
        factory(exports, require("./babelHelpers"));
    } else {
        var mod = {
            exports: {}
        };
        factory(mod.exports, global.babelHelpers);
        global.util = mod.exports;
    }
})(this, function (exports, babelHelpers) {
    'use strict';

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

        return Object.keys(query)
        // 打平结构
        .reduce(function (items, name) {

            var value = query[name];
            var item = Array.isArray(value) ? value.map(function (v) {
                return {
                    name: name,
                    value: v
                };
            }) : { name: name, value: value };

            return items.concat(item);
        }, [])
        // 过滤掉无效项
        .reduce(function (result, _ref) {
            var name = _ref.name;
            var value = _ref.value;

            if (value != null) {
                result.push(encodeURIComponent(name) + '=' + encodeURIComponent(value));
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

        var originHref = href;
        var hashIndex = href.indexOf('#');
        var hash = '';

        if (hashIndex !== -1) {
            hash = href.slice(hashIndex);
            href = href.slice(0, hashIndex);
        }

        var searchIndex = href.indexOf('?');
        var search = '';
        var querystring = '';
        var query = {};

        if (searchIndex !== -1) {
            search = href.slice(searchIndex);
            querystring = search.slice(1);
            query = querystring ? parseQueryString(querystring) : {};
            href = href.slice(0, searchIndex);
        }

        var pathname = href;

        return {
            href: originHref,
            pathname: pathname, search: search, hash: hash, query: query, querystring: querystring
        };
    }

    exports.pasreHref = pasreHref;

    exports.addQuery = function addQuery(path, query) {

        var location = pasreHref(path);

        var nextQuery = Object.keys(query).reduce(function (currentQuery, key) {

            var value = query[key];
            var currentQueryValue = currentQuery[key];

            if (Array.isArray(currentQueryValue)) {
                currentQuery[key] = currentQueryValue.concat(value);
            } else if (currentQuery[key] != null) {
                currentQuery[key] = [currentQueryValue].concat(value);
            } else {
                currentQuery[key] = value;
            }

            return currentQuery;
        }, location.query);

        var nextQuerystring = toQueryString(nextQuery);

        return nextQuerystring ? location.pathname + '?' + nextQuerystring : location.pathname;
    };

    exports.guid = function guid() {
        var length = arguments.length <= 0 || arguments[0] === undefined ? 8 : arguments[0];

        return Math.random().toString(36).substr(2, length);
    };

    function parseQueryString(querystring) {

        if (!querystring) {
            return {};
        }

        return querystring.split('&').reduce(function (query, term) {

            var index = term.indexOf('=');

            var name = decodeURIComponent(term.slice(0, index));
            var value = decodeURIComponent(term.slice(index + 1));

            if (!name) {
                return query;
            }

            var currentValue = query[name];

            if (Array.isArray(currentValue)) {
                currentValue.push(value);
            } else if (currentValue) {
                query[name] = [currentValue, value];
            } else {
                query[name] = value;
            }

            return query;
        }, {});
    }

    exports.parseQueryString = parseQueryString;

    exports.getHash = function getHash(target) {
        var href = target.href;
        var index = href.indexOf('#');
        return index === -1 ? '' : href.slice(index + 1);
    };

    var HTTP_PREFIX_REGEXP = /^(https?:\/\/[^\/]*)/;

    exports.normalize = function normalize(path) {

        var match = HTTP_PREFIX_REGEXP.exec(path);

        if (match) {
            path = path.slice(match[1].length);
        }

        if (path.charAt(0) !== '/') {
            path = '/' + path;
        }

        return path;
    };
});