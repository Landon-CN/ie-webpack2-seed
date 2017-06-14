const tpl = __inline('./notice.html');
const mustache = window.Mustache;

window.components.notice = function(parent) {
    const dom = $(mustache.render(tpl,{}));

    dom.on('click','.notice-nav>li',function (event) { 
        event.stopPropagation();
        $(this).addClass('active').siblings().removeClass('active')
     });

    $(parent).append(dom);
    
}