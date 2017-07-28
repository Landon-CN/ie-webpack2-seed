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
import * as Constants from '../talkConstants';


export default function init(queueLength, cb = () => {}) {


    if (!(this instanceof init)) {
        return new init(queueLength, cb);
    }

    let dom = $(mustache.render(tpl, {}));
    dom.on('click', '.btn-continue', (event) => {
        cb();
        this.cancel().then((result) => {
            result && this.close();
        });
    });

    this.lineModal = modal(dom);
    this.dom = dom;
    this.queue = dom.find('.queue');
    this.change(queueLength);
}

init.prototype.cancel = function () {
    return $.ajax({
        url: '/IncomingLine/cancelInQueue.htm',
        contentType: 'application/json; charset=utf-8',
        type: 'post',
        data: {
            initSource: '03',
            groupId: globalVar.groupId,
            previousDialogId: globalVar.dialogId
        }
    }).then((res) => {
        if (res.resultCode === Constants.AJAX_SUCCESS_CODE && !!res.data.result) {
            const data = res.data;
            globalVar.dialogId = data.currentDialogId;
            globalVar.targetServiceId = data.toUserId;
            globalVar.msgType = data.currentDialogType == 1 ? Constants.MSG_TYPE_BOT : Constants.MSG_TYPE_SERVICE;
            return true;
        }
        return false;
    });
}

init.prototype.open = function () {
    this.lineModal.open();
    // 立即去取一次排队数据
    this.interval(0);
    return this;
}
init.prototype.close = function () {
    this.lineModal.close();
    this.timer && clearTimeout(this.timer);
}

init.prototype.change = function (queue) {
    this.queue.text(queue);
    return this;
}

init.prototype.interval = function (timeout = 30000) {
    this.timer = setTimeout(() => {
        queryQueueLenght().then((result) => {
            let data = result.data;
            if (data.length > 0) {
                this.change(data.length);
                this.interval();
            }

        });
    }, timeout);

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
