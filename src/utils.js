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


export const debounce = function (func, wait, immediate) {
    var timeout, result;

    var later = function (context, args) {
        timeout = null;
        if (args) result = func.apply(context, args);
    };

    var debounced = restArgs(function (args) {
        if (timeout) clearTimeout(timeout);
        if (immediate) {
            var callNow = !timeout;
            timeout = setTimeout(later, wait);
            if (callNow) result = func.apply(this, args);
        } else {
            timeout = delay(later, wait, this, args);
        }

        return result;
    });

    debounced.cancel = function () {
        clearTimeout(timeout);
        timeout = null;
    };

    return debounced;
};

function delay(func, wait, args) {
    return setTimeout(function () {
        return func.apply(null, args);
    })
}
