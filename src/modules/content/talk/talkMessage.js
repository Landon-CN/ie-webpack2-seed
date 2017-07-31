import moment from 'moment';
import mustache from 'mustache';
import msgTpl from './message.html';
import mutiPageTpl from './mutiPage.html';
import * as service from './talkService';
import * as utils from './talkUtils';
import * as Constants from './talkConstants';
import Appraise from './appraise/appraise';
import line from './line/line';
import globalVar from 'globalVar';
import {
    modal
} from 'components';
import botParse from './botContentParse';

// 最多显示多少个列表
const BOT_LIST_MAX_SHOW = 3;

export default function (talk) {
    Object.assign(talk.prototype, {
        addMsg,
        historyClickListener,
        historyRest,
        getHistory,
        offlineMsgInteval,
        resolveMsg,
        pollInterval,
        serviceGroupListener,
        addAppraise,
        cancelLine,
        botMsgChangeListener,
        botAnswersListener,
        mutiPageModal
    });

    const init = talk.prototype.init;
    talk.prototype.init = function (...args) {
        init.apply(this, args);
        this.historyDom = this.dom.find('.history-msg');
        this.msgBox = this.dom.find('.message-box');
        this.scroll = this.dom.find('.scroll');
        this.historyClickListener();
        this.pollInterval();
        this.offlineMsgInteval();
        this.serviceGroupListener();
        this.botMsgChangeListener();
        this.botAnswersListener();
        this.botMsgList = {};


        // 重新进线
        if (globalVar.msgType === Constants.MSG_TYPE_SERVICE) {
            this.getHistory().then(() => {
                this.inService(Constants.RECONNECT_MESSAGE);
            });
        } else {
            this.addMsg({
                service: true,
                message: globalVar.welcomeWords,
                time: moment()
            });
        }

    }
}


// 添加消息
let lastTime;
const intervalTime = 5 * 60 * 1000; // 间隔5分钟以上才会显示时间条

const timeNow = moment();
// append false 代表是历史记录
function addMsg(data, append = true) {
    // console.log('添加消息==>', data);

    if (Array.isArray(data)) {
        data = {
            list: data
        }
    } else {
        data = {
            list: [data]
        }
    }


    const previousDayTime = [];
    for (let i = 0; i < data.list.length; i++) {
        let item = data.list[i];
        let time = moment(item.time || Date.now());

        if (item.bot) {
            resolveBotMsg(this, item);
        }

        // 历史记录，只展示最早的那个日期,按天算
        if (time < timeNow) {
            let day = time.format('YYYY-MM-DD');

            // 已经有时间展示记录，跳过
            if (previousDayTime.indexOf(day) > -1) {
                continue;
            }
            previousDayTime.push(day);
            data.list.splice(i, 0, {
                timeShow: true,
                message: time.format('YYYY-MM-DD HH:mm')
            });
            i++;
        }

        // 日期为当天
        else if (!lastTime || time - lastTime > intervalTime) {
            lastTime = time;
            data.list.splice(i, 0, {
                timeShow: true,
                message: lastTime.format('HH:mm')
            });
        }

    }


    const serviceListHtml = mustache.render(msgTpl, data);
    let dom = $(serviceListHtml);

    if (append) {
        this.msgBox.append(dom);
        // this.scroll.scrollTop(this.msgBox.height());
        this.scroll.stop().animate({
            scrollTop: this.msgBox.height()
        }, 'normal');
    } else {
        this.historyDom.after(dom);
    }

    return dom;
}

function resolveBotMsg(context, msg) {
    switch (msg.type) {
        case Constants.BOT_MESSAGE_TEXT:
            msg.botPlainText = true;
            msg.msgType = Constants.INTERACTION_TEXT;
            break;
        case Constants.BOT_MESSAGE_SUGGESTION:
        case Constants.BOT_MESSAGE_FLOD:
            msg.answer = msg.answer || msg.title;
            msg.botFlodText = true;
            msg.change = false;
            // 超过
            msg.originList = msg.list;

            if (msg.list.length > BOT_LIST_MAX_SHOW) {
                msg.list = msg.list.slice(0, BOT_LIST_MAX_SHOW);
                msg.change = true;
                msg.index = 0;
            }
            if (Constants.BOT_MESSAGE_FLOD === msg.type) {
                msg.msgType = Constants.INTERACTION_NORMAL_SELECT;
            } else {
                msg.msgType = Constants.INTERACTION_FEEDBACK_SELECT;
            }

        default:
            break;
    }

    context.botMsgList[msg.msgId] = msg;
}

// 列表模板
const listTpl = `{{#list}}
            <li data-item="{{id}}" data-id="{{msgId}}" data-type="{{msgType}}" data-code="{{scene}}">
                <span class="help-icon"></span>
                <a href="javascript:;" class="group-name">{{title}}</a>
            </li>
            {{/list}}`;

function botMsgChangeListener() {
    let that = this;
    this.dom.on('click', '.change-other>a', function (event) {
        event.preventDefault();
        let $item = $(this);
        const msgId = $item.data('id');
        const msg = that.botMsgList[msgId];
        msg.index += BOT_LIST_MAX_SHOW;
        if (msg.index > msg.originList.length) {
            msg.index = 0;
        }
        const nextList = msg.originList.slice(msg.index, msg.index + BOT_LIST_MAX_SHOW);
        msg.list = nextList;
        let $list = mustache.render(listTpl, msg);


        $item.parent().next('.answers-group').html($list);
    });
}

/**
 * 机器人回复列表点击监听
 * 发送消息：选择项
 * 添加消息：选择项
 */
function botAnswersListener() {
    const that = this;
    this.dom.on('click', '.answers-group>li', function (event) {
        event.stopPropagation();
        event.preventDefault();
        const $dom = $(this);
        const msgId = $dom.data('id');
        const sceneItem = $dom.data('item');
        const sceneCode = $dom.data('code');
        const message = $dom.text();
        const type = $dom.data('type');

        that.addMsg({
            user: true,
            message
        });

        service.sendMsg(globalVar.targetServiceId, {}, {
            type,
            sceneCode,
            sceneItem,
            msgId
        });
    });
}


// 点击状态
let noMorePage = false,
    pageLoading = false,
    backMsg = '',
    historyTime = moment();
let pageSize = 10;

function historyClickListener() {
    this.dom.on('click', '.history-msg', () => {
        this.getHistory();
    });
}

function historyRest() {
    noMorePage = false;
    pageLoading = false;
    backMsg && this.historyDom.text(backMsg);
}

function getHistory() {
    if (noMorePage || pageLoading) {
        return;
    }
    let historyDom = this.historyDom;
    pageLoading = true;
    backMsg = historyDom.text();
    historyDom.text('加载中请稍后...')


    let params = {
        expectSize: pageSize,
        endDate: historyTime.format('YYYY-MM-DD HH:mm:SS')
    };

    const errorHandler = () => {
        pageLoading = false;
        historyDom.text(backMsg)
    }

    return service.historyMsg(params).then((result) => {

        if (result.resultCode !== Constants.AJAX_SUCCESS_CODE) {
            return errorHandler();
        }

        let data = result.data;
        if (data.length < pageSize) {
            noMorePage = true;
            historyDom.text('没有更多了');
        } else {
            historyDom.text(backMsg);
        }



        let userId = globalVar.userId;
        let msgList = [];
        for (let i = 0; i < data.length; i++) {
            let item = data[i];
            if (i === 0) {
                historyTime = moment(item.sendTime)
            }
            let type = parseInt(item.msgType, 10);
            switch (type) {
                case Constants.HISTORY_OLD_BOT_ASK:
                case Constants.HISTORY_OLD_BOT_REPLY:
                    msgList.push({
                        service: item.from != globalVar.userId,
                        user: item.from == globalVar.userId,
                        message: item.content,
                        time: item.sendTime
                    });
                    break;
                case Constants.HISTORY_SERVICE:
                    msgList.push({
                        service: item.from != globalVar.userId,
                        user: item.from == globalVar.userId,
                        message: utils.parseContent(item.content),
                        time: item.sendTime
                    });
                    break;
                case Constants.HISTORY_NEW_BOT_ASK:
                    let content;
                    try {
                        content = JSON.parse(item.content);
                    } catch (e) {
                        console.log('历史消息解析:HISTORY_NEW_BOT_ASK', e);
                        break;
                    }
                    msgList.push({
                        service: item.from != globalVar.userId,
                        user: item.from == globalVar.userId,
                        message: content.question,
                        time: item.sendTime
                    });
                    break;
                case Constants.HISTORY_NEW_BOT_REPLY:
                    let botMsg = botParse(item.content);
                    if (botMsg) {
                        botMsg.bot = true;
                        msgList.push(botMsg);
                    }
                    break;
                default:
                    console.log('历史消息解析:未知类型', item.msgType);

                    break;
            }


        }

        this.addMsg(msgList, false);
        pageLoading = false;
    }, errorHandler);
}


function offlineMsgInteval() {
    this.offlineTimer = setTimeout(() => {
        service.getOfflineMsg().then((result) => {
            if (result.resultCode === Constants.AJAX_SUCCESS_CODE) {
                if (result.data.length > 0) {
                    this.resolveMsg(result.data);
                }
            }

            this.offlineMsgInteval();
        });
    }, Constants.OFFLINE_MSG_TIME);
}

/**
 * 处理服务端返回结果
 * @param {*} resData
 */
function resolveMsg(resData) {
    console.log('收到推送消息==>', resData);

    let msgList = [];
    for (let i = 0; i < resData.length; i++) {
        let item = resData[i];

        if (item.type == Constants.INVITE_MESSAGE) {
            this.addAppraise();
            break;
        }

        if (item.type == Constants.CLOSE_MESSAGE) {
            // 结束会话
            globalVar.targetServiceId = null;
            globalVar.isRate = false;
            globalVar.groupId = null;
            globalVar.dialogId = null;
            globalVar.isClose = true;
            service.inlineInit().then(() => {
                this.groupClick = false;
            });
            msgList.push({
                dialog: true,
                message: Constants.CLOSE_MESSAGE_TEXT,
                time: moment()
            });
            break;
        }

        // 排队进线成功
        if (item.type == Constants.INLINE_MESSAGE) {
            globalVar.targetServiceId = item.fromUserId;
            globalVar.dialogId = item.dialogId;
            globalVar.msgType = Constants.MSG_TYPE_SERVICE;
            this.lineModal.close();
            globalVar.isClose = false;
            this.inService(Constants.INSERVICE_EMSSAGE);
            break;
        }

        // 真人客服需要消息回执
        if (item.type == Constants.INSTANT_MESSAGE && item.offline === false) {
            service.msgReceipt({
                msgId: item.id || item.msgId,
                toUserId: globalVar.targetServiceId,
                packetId: item.packetId
            });
        }

        // 转接成功
        if (item.type == Constants.DIALOG_TRANSFER_SUCCESS) {

            let nextServiceInfo;
            try {
                nextServiceInfo = JSON.parse(item.content);
            } catch (e) {
                console.error('解析转接消息失败');
                break;
            }

            globalVar.dialogId = nextServiceInfo.afterJkDialogId;
            globalVar.targetServiceId = nextServiceInfo.afterCustomerServiceUserId;
            globalVar.groupId = nextServiceInfo.afterBusinessLineId;
            msgList.push({
                dialog: true,
                message: Constants.TRANSFER_MESSAGE_SUCCESS,
                time: moment()
            });
            break;
        }

        // 转接排队
        if (item.type == Constants.DIALOG_TRANSFER_QUEUE) {
            this.lineModal.open();
            break;
        }

        // 机器人v2
        if (item.type == Constants.ROBOT_MESSAGE_V2) {
            let botMsg = botParse(item.content);
            if (botMsg) {
                botMsg.bot = true;
                msgList.push(botMsg);
            }

            break;
        }

        if (item.type == Constants.ROBOT_MESSAGE || item.type == Constants.INSTANT_MESSAGE) {
            // 旧机器人
            msgList.push({
                service: true,
                message: utils.parseContent(item.content),
                time: item.sendTime
            });
            break;
        }

        console.error('消息类型未知:' + item.type);



    }


    this.addMsg(msgList);
}


// 建立长连接
function pollInterval() {


    const errorHandler = (error) => {
        // 错误，5s后尝试重新连接
        console.log('5s后重新尝试建立长连接', error);
        setTimeout(() => {
            this.pollInterval();
        }, 5000);
    }

    let t = service.pollMsg().then((result) => {

        if (result.resultCode === '00000') {
            let data = result.data;

            // 重新建立长连接
            if (data.data && data.data === 'dying') {
                return this.pollInterval();
            }

            if (data.channel === 'hello') {
                this.resolveMsg(data.data)
            }
            return this.pollInterval();
        }

        // 打开多个网页
        else if (result.resultCode === 'JTK10000018') {

            console.info('多窗口登录，取消消息获取');
            this.offlineTimer && clearTimeout(this.offlineTimer);
            return this.mutiPageModal();
        } else {
            errorHandler(result)
        }



    }, errorHandler);


}


// 添加评价
function addAppraise() {
    let dom = this.addMsg({
        service: true,
        date: Date.now()
    });

    // TODO: cb暂时变为空，看下效果
    Appraise(dom.find('.message-text'), undefined, undefined).open();
}

function serviceGroupListener(params) {
    // 选择问题分组
    // 有且只能点一次
    this.groupClick = false;
    const errorHandler = () => {
        console.log('进线失败');

        this.groupClick = false;
        this.addMsg([{
            dialog: true,
            message: Constants.ERROR_MESSAGE
        }]);
    }
    this.dom.on('click', '.service-group > li', (event) => {
        if (this.groupClick) {
            return;
        }
        let item = $(event.currentTarget);
        this.groupClick = true;
        let id = item.data('id');
        globalVar.groupId = id;
        item.find('.group-name').addClass('active');
        service.queryServiceId(id).then((result) => {

            if (result.resultCode !== Constants.AJAX_SUCCESS_CODE) {
                return errorHandler();
            }

            let customerServiceId = result.data.customerServiceId;
            globalVar.isClose = false;
            if (!customerServiceId) {
                // 要排队
                this.lineModal.open().change(result.data.queueLength);

                return;
            }
            let delTalkContent = false;
            if (globalVar.targetServiceId === globalVar.botId) {
                delTalkContent = true;
            }

            globalVar.targetServiceId = customerServiceId;
            globalVar.dialogId = result.data.dialogId;
            globalVar.msgType = Constants.MSG_TYPE_SERVICE;

            this.inService(Constants.INSERVICE_EMSSAGE, delTalkContent);

            this.addMsg([{
                service: true,
                message: result.data.welcomeWords
            }]);

        }, errorHandler);
    });

}

/**
 * 取消排队
 */
function cancelLine() {
    this.groupClick = false;
}

/**
 * 多页面打开，弹窗提示
 */
function mutiPageModal() {
    let $dom = $(mustache.render(mutiPageTpl, {}));
    $dom.on('click', '.btn', () => {
        window.location.href = 'about:black';
    });
    modal($dom).open();
}
