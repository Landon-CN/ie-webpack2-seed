const tpl = __inline('./header.html');
const mustache = window.Mustache;

window.components.header = function (parent) {
    const dom = $(mustache.render(tpl, {}));

    dom.on('click', '.online', function (event) {
        onlineServiceClick();
    });

    window.headerChangeToSerice = function () {
        dom.find('.online').remove();
        dom.find('.name-small').text('人工客服');
    }

    $(parent).append(dom);
}