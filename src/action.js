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
export const TRAVEL = 'TRAVEL';

/**
 * 这货的含义是初始化操作
 *
 * @const
 * @type {string}
 */
export const INIT = 'INIT';

/**
 * 这货代表了pushState操作
 *
 * @const
 * @type {string}
 */
export const PUSH = 'PUSH';

/**
 * 这货代表了replaceState操作
 *
 * @const
 * @type {string}
 */
export const REPLACE = 'REPLACE';

export default {
    TRAVEL,
    PUSH,
    REPLACE
};
