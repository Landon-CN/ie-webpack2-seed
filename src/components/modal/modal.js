import tpl from './modal.html';
import mustache from 'mustache';
import $ from 'jquery';
import './modal.less';

export default function (dom, clickClose = false) {
    let modal = $(mustache.render(tpl, {}));
    let contentDiv = modal.find('.vertical-center>div');
    contentDiv.append(dom);

    return {
        open() {
            contentDiv.addClass('active-in');
            $('body').append(modal);
            setTimeout(function () {
                contentDiv.removeClass('active-in');
            }, 50);
            if (clickClose) {
                modal.click(() => {
                    this.close();
                });
            }
        },
        close() {
            modal.remove();
        }
    };
}
