const tpl = __inline('./header.html');
const mustache = window.Mustache;

window.components.header = function (parent) {
    const dom = $(mustache.render(tpl, {}));

    dom.on('click', '.online', function (event) {
        onlineServiceClick();
    });

    $(parent).append(dom);
}