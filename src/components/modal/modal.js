import tpl from './modal.html';
import mustache from 'mustache';
import $ from 'jquery';
import './modal.less';

export default function (dom) {
    let modal = $(mustache.render(tpl, {}));
    modal.find('.vertical-center').append(dom);

    return {
        open(){
            $('body').append(modal);
        },
        close() {
            modal.remove();
        }
    }
}
