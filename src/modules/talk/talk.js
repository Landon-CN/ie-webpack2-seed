import mustache from 'mustache';
import $ from 'jquery';

import header from '../header/header';
import globalVar from 'globalVar';
import * as service from './talkService';
import * as Constants from './talkConstants';
import talkInput from './talkInput';
import talkMessage from './talkMessage';
import talkTool from './talkTool';
import moment from 'moment';

// 默认对话机器人
globalVar.targetServiceId = globalVar.botId;

talk.prototype.init = function () {


    this.$dom.show();

    // this.onlineServiceClick();
}

talkInput(talk);
talkMessage(talk);
talkTool(talk);

function talk() {

    if (!(this instanceof talk)) {
        return new talk();
    }

    this.$dom = $('.talk-body');
    this.onlineClick = false;

}






talk.prototype.onlineServiceClick = function () {

    if (this.onlineClick || globalVar.queueLength > 0) {
        return;
    }
    this.onlineClick = true;
    const errorHandler = () => {
        console.log('获取分组失败');
        this.onlineClick = false;
    }
    service.getServiceList().then((result) => {

        if (result.resultCode !== Constants.AJAX_SUCCESS_CODE) {
            return errorHandler();
        }
        console.log('进线分组获取成功');


        const data = result.data;

        const list = data.showBusinessInfo.sort((a, b) => a.groupId - b.groupId);

        if (list.length === 1) {
            // 只有一个分组，直接进线
            console.log('只有一个分组', list[0].groupId);

            const groupId = list[0].groupId;
            this.chooseGroupInService(groupId);
        } else {
            // 多个分组，展示所有分组
            list.forEach(function (element, index) {
                element.idx = index + 1;
            }, this);

            this.addMsg({
                serviceGroup: true,
                serviceList: list,
                time: moment()
            });
        }

        this.onlineClick = false;
    }, errorHandler);

};

talk.prototype.inService = function inService(message) {
    this.onlineClick = true; //防止再次进线
    this.historyRest(); // 进线后可以再次查看历史记录
    header.headerInservice();
    this.onlineServiceShow();
    this.addMsg({
        dialog: true,
        message: message
    })
};

// 进线成功后，显示某些元素
talk.prototype.onlineServiceShow = function onlineServiceShow() {
    // 显示图片上传和评价按钮
    this.$dom.find('.tool-file,.tool-rate').css('display', 'inline-block');
    this.$dom.find('.tool-service').hide();
    // 显示历史记录按钮
    this.historyDom.show();
    this.$dom.find('.message-history').show();
    this.imgUploadListener();
}


export default new talk();
