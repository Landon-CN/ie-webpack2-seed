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



    this.onlineServiceClick();
}

// talkInput(talk);
talkMessage(talk);
// talkTool(talk);

function talk() {

    if (!(this instanceof talk)) {
        return new talk();
    }

    this.$dom = $('.talk-body');
    this.onlineClick = false;


}






talk.prototype.onlineServiceClick = function () {

    if (this.onlineClick) {
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

        const data = result.data;

        const list = data.showBusinessInfo.sort((a, b) => a.groupId - b.groupId);
        list.forEach(function (element, index) {
            element.idx = index + 1;
        }, this);
        this.addMsg({
            serviceGroup: true,
            serviceList: list,
            time: moment()
        });
    }, errorHandler);

};

talk.prototype.inService = function inService(message) {
    this.onlineClick = true; //防止再次进线
    this.historyRest(); // 进线后可以再次查看历史记录
    headerChangeToSerice();
    this.onlineServiceShow();
    this.addMsg({
        dialog: true,
        message: message
    })
};

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