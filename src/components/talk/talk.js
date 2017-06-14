const tpl = __inline('./talk.html');
const mustache = window.Mustache;

window.components.talk = function(parent) {
    const dom = $(mustache.render(tpl,{}));

    $(parent).append(dom);
    
}