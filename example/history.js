/**
 * @file numen expamle
 * @author leon(ludafa@outlook.com)
 */

import BrowserHistory from 'numen/HistoryLocator';

export function init() {

    let locator = new BrowserHistory();

    locator
        .on(function (location) {
            console.log('listen', location, locator);
        })
        .use(function (location, next, done) {

            // console.log('interceptor', location);

            let {query} = location;

            if (query && query.name === 'a') {
                done(false);
                return;
            }

            next();

        })
        .start();

    var pushStateButton = document.getElementById('push');

    pushStateButton.onclick = function () {
        locator.redirect('you man~');
    };

    function linkClickHandler(e) {
        e.preventDefault();
        let {pathname, search, hash} = e.target;
        let href = pathname + search + hash;
        locator.redirect(href);
    }

    [].slice.call(document.querySelectorAll('a')).forEach(function (link) {
        link.onclick = linkClickHandler;
    });

}
