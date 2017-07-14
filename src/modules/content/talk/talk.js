import tpl from './talk.html';
import mustache from 'mustache';
import $ from 'jquery';
import './talk.less';
import line from './line/line';

import {
    headerChangeToSerice
} from '../../header/header';
import globalVar from 'globalVar';
import * as service from './talkService';
import * as Constants from './talkConstants';
import talkInput from './talkInput';
import talkMessage from './talkMessage';
import talkTool from './talkTool';
import moment from 'moment';

// 默认对话机器人
globalVar.targetServiceId = globalVar.botId;

talk.prototype.init = function (parent) {
    $(parent).append(this.dom);
}

talkInput(talk);
talkMessage(talk);
talkTool(talk);

function talk() {

    if (!(this instanceof talk)) {
        return new talk();
    }

    this.dom = $(mustache.render(tpl, {}));
    this.lineModal = line(0, () => {
        this.cancelLine();
    });
    this.onlineClick = false;
    this.judgePrviousService();

}






talk.prototype.onlineServiceClick = function () {

    if (this.onlineClick) {
        return;
    }
    this.onlineClick = true;

    service.getServiceList().then((result) => {
        const data = result.data;
        const list = data.showBusinessInfo.sort((a, b) => a.groupId > b.groupId);
        this.addMsg({
            serviceGroup: true,
            serviceList: list,
            time: moment()
        });
    });

};

talk.prototype.inService = function inService(message, del = false) {
    // 进线成功前一个聊天记录

    if (del) {
        this.dom.find('.message-row').remove();
    }

    this.onlineClick = true; //防止再次进线
    this.historyRest(); // 进线后可以再次查看历史记录
    headerChangeToSerice();
    this.onlineServiceShow();

    this.addMsg({
        dialog: true,
        message,
        time: moment()
    });
};

talk.prototype.judgePrviousService = function () {
    // 上次处于进线状态
    service.getServiceList().then((result) => {
        let message = Constants.BOT_HEELO_MESSAGE;
        if (result.data.continuePreviousDialog) {
            globalVar.targetServiceId = result.data.customerServiceId;
            globalVar.dialogId = result.data.previousDialogId;

            return this.getHistory().then(() => {
                this.inService(Constants.RECONNECT_MESSAGE);
            });
        }

        if (result.data.queueLength > 0) {
            globalVar.groupId = result.data.previousGroupId;
            this.lineModal.change(result.data.queueLength).open();
        }

        // 添加默认对话
        setTimeout(() => {
            this.addMsg({
                service: true,
                message,
                time: moment()
            });
        }, 100);
    });
}
// 进线成功后，显示某些元素
talk.prototype.onlineServiceShow = function onlineServiceShow() {
    // 显示图片上传和评价按钮
    this.dom.find('.rate-tool,.fileinput-button').css('display', 'inline-block');

    // 如果已评价，则不提示
    !globalVar.isRate && this.dom.find('.rate-tooltip').show();

    // 显示历史记录按钮
    this.historyDom.show();
    this.imgUploadListener();
}


export default new talk();
