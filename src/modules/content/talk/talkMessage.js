import moment from 'moment';
import mustache from 'mustache';
import msgTpl from './message.html';
import * as service from './talkService';
import * as utils from './talkUtils';
import * as Constants from './talkConstants';
import Appraise from './appraise/appraise';
import line from './line/line';
import globalVar from 'globalVar';

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
        cancelLine
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
        this.scroll.scrollTop(this.msgBox.height());
    } else {
        this.historyDom.after(dom);
    }

    return dom;
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

    return service.historyMsg(params).then((result) => {
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

            msgList.push({
                service: item.from != globalVar.userId,
                user: item.from == globalVar.userId,
                message: utils.parseContent(item.content),
                time: item.sendTime
            });
        }

        this.addMsg(msgList, false);
        pageLoading = false;
    }, function (event) {
        pageLoading = false;
        historyDom.text(backMsg)
    });
}


function offlineMsgInteval() {
    setTimeout(() => {
        service.getOfflineMsg().then((result) => {
            if (result.data.length > 0) {
                this.resolveMsg(result.data);
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

        if (item.type == 5) {
            this.addAppraise();
            break;
        }

        if (item.type == 7) {
            // 结束会话
            globalVar.targetServiceId = null;
            globalVar.isRate = false;
            globalVar.groupId = null;
            globalVar.dialogId = null;
            globalVar.isClose = true;
            this.groupClick = false;
            this.addMsg({
                dialog: true,
                message: Constants.CLOSE_MESSAGE,
                time: moment()
            });
            break;
        }

        // 排队进线成功
        if (item.type == 6) {
            globalVar.targetServiceId = item.fromUserId;
            this.lineModal.close();
            globalVar.isClose = false;
            this.inService(Constants.INSERVICE_EMSSAGE);
            break;
        }

        // 真人客服需要消息回执
        if (item.type == 2 && item.offline === false) {
            service.msgReceipt({
                msgId: item.id || item.msgId,
                toUserId: globalVar.targetServiceId,
                packetId: item.packetId
            });
        }

        msgList.push({
            service: true,
            message: utils.parseContent(item.content),
            time: item.sendTime
        });
    }
    this.addMsg(msgList);
}


// 建立长连接
function pollInterval() {
    console.log('尝试建立长连接');

    let t = service.pollMsg().then((result) => {
        let data = result.data;

        // 重新建立长连接
        if (data.data && data.data === 'dying') {
            console.log('长连接正常结束,无消息返回')
            return this.pollInterval();
        }

        if (data.channel === 'hello') {
            this.resolveMsg(data.data)
        }

        this.pollInterval();

    }).always(() => {
        // 错误，5s后尝试重新连接
        console.log('5s后重新尝试建立长连接');
        setTimeout(() => {
            this.pollInterval();
        }, 5000);
    });



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

            this.inService(Constants.INSERVICE_EMSSAGE, delTalkContent);

            this.addMsg([{
                service: true,
                message: result.data.welcomeWords
            }]);

        }, () => {
            this.groupClick = false;
            this.addMsg([{
                dialog: true,
                message: Constants.ERROR_MESSAGE
            }]);
        });
    });

}

/**
 * 取消排队
 */
function cancelLine() {
    this.groupClick = false;
}
