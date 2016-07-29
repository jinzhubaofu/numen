(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(['exports'], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports);
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports);
    global.action = mod.exports;
  }
})(this, function (exports) {
  'use strict';

  /**
   * @file history/Action
   * @author leon(ludafa@outlook.com)
   */

  /**
   * 这货代表了浏览器中的原生动作，比如前进、后退。
   * 这货是默认动作。
   *
   * @const
   * @type {string}
   */
  exports.TRAVEL = 'TRAVEL';

  /**
   * 这货的含义是初始化操作
   *
   * @const
   * @type {string}
   */
  exports.INIT = 'INIT';

  /**
   * 这货代表了pushState操作
   *
   * @const
   * @type {string}
   */
  exports.PUSH = 'PUSH';

  /**
   * 这货代表了replaceState操作
   *
   * @const
   * @type {string}
   */
  exports.REPLACE = 'REPLACE';
});