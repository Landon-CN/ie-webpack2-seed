const tpl = __inline('./header.html');
const mustache = window.Mustache;

window.components.header = function(parent) {
    const dom = $(mustache.render(tpl,{}));

    $(parent).append(dom);
}