import tpl from './content.html';
import mustache from 'mustache';
import $ from 'jquery';
import './content.less';
import talk from './talk/talk';
import notice from './notice/notice';


export default function(parent) {
    const dom = $(mustache.render(tpl,{}));

    // 加载公告栏
    notice(dom.find('.right'));
    // 加载聊天框
    talk.init(dom.find('.left'));

    $(parent).append(dom);

}
