const tpl = __inline('./header.html');
const mustache = window.Mustache;

window.components.header = function (parent) {
    const dom = $(mustache.render(tpl, {}));

    dom.on('click', '.online', function (event) {
        onlineServiceClick();
    });

    window.headerChangeToSerice = function () {
        dom.find('.online').remove();
        dom.find('.name-small').text('在线客服');
        dom.find('.qr-code').addClass('big');
    }

    $(parent).append(dom);
}