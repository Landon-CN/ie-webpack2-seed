const tpl = __inline('./content.html');
const mustache = window.Mustache;

window.components.content = function(parent) {
    const dom = $(mustache.render(tpl,{}));

    // 加载公告栏    
    components.notice(dom.find('.right'));
    // 加载聊天框
    components.talk(dom.find('.left'));

    $(parent).append(dom);


}