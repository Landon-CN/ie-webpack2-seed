import tpl from './header.html';
import mustache from 'mustache';
import $ from 'jquery';
import './header.less';
import {onlineServiceClick} from '../content/talk/talk';

let dom;
export default function (parent) {
    dom = $(mustache.render(tpl, {}));

    dom.on('click', '.online', function (event) {
        onlineServiceClick();
    });

    $(parent).append(dom);
}

function headerChangeToSerice() {
    dom.find('.online').remove();
    dom.find('.name-small').text('在线客服');
    dom.find('.qr-code').addClass('big');
}

export {
    headerChangeToSerice
}