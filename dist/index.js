;(function() {
"use strict";

window.components = {};

$(function () {
    var test = window.components.test;
    // $('body').html(test('hello world'));
});
}());

;(function() {
'use strict';

var NAME = 'components/test.tpl.html';
var tpl = window.templates[NAME];
var mustache = window.Mustache;

window.components.test = function (name, target) {
    var renderResult = mustache.render(tpl, { name: name });
    if (target) {
        $(target).html(renderResult);
    }
    return renderResult;
};
}());

//# sourceMappingURL=maps/index.js.map
