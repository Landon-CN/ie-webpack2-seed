import tpl from './notice.html';
import mustache from 'mustache';
import $ from 'jquery';
import './notice.less';

export default function(parent) {
    const dom = $(mustache.render(tpl,{}));

    dom.on('click','.notice-nav>li',function (event) { 
        event.stopPropagation();
        $(this).addClass('active').siblings().removeClass('active')
     });

    $(parent).append(dom);
    
}