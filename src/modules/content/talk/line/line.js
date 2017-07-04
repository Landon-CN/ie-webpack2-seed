/**
 * 排队
 */
import tpl from './line.html';
import mustache from 'mustache';
import $ from 'jquery';
import './line.less';
import {
    modal
} from 'components';
import globalVar from 'globalVar';


export default function init(queue, cb = () => {}) {


    if (!(this instanceof init)) {
        return new init(queue, cb);
    }

    let dom = $(mustache.render(tpl, {}));
    dom.on('click', '.btn-continue', (event) => {
        cb();
        this.close();
    });

    this.lineModal = modal(dom);
    this.dom = dom;
    this.queue = dom.find('.queue');
}

init.prototype.open = function () {
    this.lineModal.open();
    this.interval();
    return this;
}
init.prototype.close = function () {
    // TODO: 取消定时器
    this.lineModal.close();
}

init.prototype.change = function (queue) {
    this.queue.text(queue);
    return this;
}

init.prototype.interval = function () {
    setTimeout(() => {
        queryQueueLenght().then((result) => {
            let data = result.data;

            this.change(data.length);
            this.interval();
        });
    }, 30000);

}


function queryQueueLenght() {
    return $.ajax({
        url: '/IncomingLine/queryQueueLength.htm',
        contentType: 'application/json; charset=utf-8',
        type: 'post',
        data: {
            groupId: globalVar.groupId
        }
    })
}
