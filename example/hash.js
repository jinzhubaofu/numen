/**
 * @file numen expamle
 * @author leon(ludafa@outlook.com)
 */

import HashLocator from 'numen/HashLocator';

export function init() {

    let locator = new HashLocator();

    locator
        .on(function (location) {
            console.log('listen', location);
        })
        .use(function (location, next, done) {

            // console.log('interceptor', location);

            if (location.pathname === '/a') {
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
        let {href} = e.target;
        let hashIndex = href.indexOf('#');
        locator.redirect(hashIndex === -1 ? '/' : href.slice(hashIndex + 1));
    }

    [].slice.call(document.querySelectorAll('a')).forEach(function (link) {
        link.onclick = linkClickHandler;
    });

}
