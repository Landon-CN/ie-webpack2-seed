import $ from 'jquery';

export const componentShow = (function () {
    const cache = {};
    return function (parent, dom, id) {
        if (!id) {
            id = Math.random();
        }
        if (!cache[id]) {
            cache[id] = true;
            $(parent).append(dom);
        }
        $(dom).show();
        return id;
    }
})();
