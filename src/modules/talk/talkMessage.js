import moment from 'moment';
import mustache from 'mustache';
import msgTpl from './message.html';
import mutiPageTpl from './mutiPage.html';
import imgModalTpl from './imgModal.html';
import * as service from './talkService';
import * as utils from './talkUtils';
import * as Constants from './talkConstants';
// import Appraise from './appraise/appraise';
// import line from './line/line';
import globalVar from 'globalVar';
import {
    modal
} from 'components';
import botParse, {
    suggest
} from './botContentParse';

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
        botAnswersListener,
        mutiPageModal,
        imgModalListener,
        botAnswerRateListener,
        cancelQueueListener,
        addLine
    });

    const init = talk.prototype.init;
    talk.prototype.init = function (...args) {
        init.apply(this, args);
        this.historyDom = this.$dom.find('.history-msg');
        this.msgBox = this.$dom.find('.talk-message');

        this.historyClickListener();
        this.pollInterval();
        this.offlineMsgInteval();
        this.serviceGroupListener();
        this.cancelQueueListener();
        this.botAnswersListener();
        this.imgModalListener();
        // this.botAnswerRateListener();
        this.botMsgList = {};
        this.$queueDom = null; // 排队消息



        // 重新进线
        if (globalVar.msgType === Constants.MSG_TYPE_SERVICE) {
            this.inService(Constants.RECONNECT_MESSAGE);
            this.getHistory();

        } else {
            // 机器人，发送欢迎语
            this.addMsg({
                service: true,
                message: globalVar.welcomeWords,
                time: moment()
            });
        }

        // 需要排队
        if (globalVar.queueLength > 0) {
            this.addLine(globalVar.queueLength);
        }



        // this.addMsg({
        //     user: true,
        //     message: "测试112313"
        // });

        // this.addMsg({
        //     bot: true,
        //     type: Constants.BOT_MESSAGE_TEXT,
        //     answer: '机器人测试',
        //     msgId: 123,
        //     scene: 'asfsd'
        // });
        // this.addMsg({
        //     user:true,
        //     message:'<img src="https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1502254226145&di=8d0aa8b710538eaa4961aa012bf3592d&imgtype=0&src=http%3A%2F%2Fimgsrc.baidu.com%2Fimgad%2Fpic%2Fitem%2F267f9e2f07082838b5168c32b299a9014c08f1f9.jpg" class="open-img">'
        // })
        // this.resolveMsg(suggest);

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
        let scrollHeight = this.msgBox.prop('scrollHeight');

        this.msgBox.stop().animate({
            scrollTop: scrollHeight
        }, 'normal');
    } else {
        this.$dom.find('.message-history').after(dom);
    }

    return dom;
}

function resolveBotMsg(context, msg) {
    switch (msg.type) {
        case Constants.BOT_MESSAGE_TEXT:
            msg.botPlainText = true;
            break;
        case Constants.BOT_MESSAGE_SUGGESTION:
        case Constants.BOT_MESSAGE_FLOD:
            msg.botFlodText = true;
            msg.list.forEach((item, index) => {
                item.idx = index + 1;
            });
            break;

        default:
            break;
    }

    // context.botMsgList[msg.msgId] = msg;
}



/**
 * 机器人回复列表点击监听
 * 发送消息：选择项
 * 添加消息：选择项
 */
function botAnswersListener() {
    const that = this;
    this.$dom.on('click', '.bot-list li', function (event) {
        event.stopPropagation();
        event.preventDefault();
        const $dom = $(this);
        const msgId = $dom.data('id');
        const sceneItem = $dom.data('item');
        const sceneCode = $dom.data('code');
        const message = $dom.data('text');
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
    this.$dom.on('click', '.history-msg', () => {
        this.getHistory();
    });
}

function historyRest() {
    noMorePage = false;
    pageLoading = false;
    backMsg && this.historyDom.text(backMsg);
}

/**
 * 获取聊天历史
 */
function getHistory() {
    if (noMorePage || pageLoading) {
        return;
    }
    let historyDom = this.historyDom;
    let $textDom = historyDom.find('.text');
    pageLoading = true;

    backMsg = $textDom.text();
    $textDom.text('加载中');
    historyDom.addClass('loading');



    let params = {
        expectSize: pageSize,
        endDate: historyTime.format('YYYY-MM-DD HH:mm:ss.SSS')
    };

    const errorHandler = () => {
        pageLoading = false;
        $textDom.text(backMsg);
        historyDom.removeClass('loading');
    }

    return service.historyMsg(params).then((result) => {

        if (result.resultCode !== Constants.AJAX_SUCCESS_CODE) {
            return errorHandler();
        }

        let data = result.data;
        if (data.length < pageSize) {
            noMorePage = true;
            $textDom.text('没有更多了');
        } else {
            $textDom.text(backMsg);
        }
        historyDom.removeClass('loading');



        let userId = globalVar.userId;
        let msgList = [];
        for (let i = 0; i < data.length; i++) {
            let item = data[i];
            if (i === 0) {
                historyTime = moment(item.sendTime, 'YYYY-MM-DD HH:mm:ss.SSS')
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
            this.$queueDom.hide('fast', () => {
                this.$queueDom.remove();
            });
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
            this.addLine(0);
            break;
        }

        // 机器人v2
        if (item.type == Constants.HISTORY_NEW_BOT_REPLY) {
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
    Appraise(dom.find('.message-text'), undefined, undefined, false).open();
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
    this.$dom.on('click', '.service-group  li', (event) => {
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
                this.addLine(result.data.queueLength);

                return;
            }

            globalVar.targetServiceId = customerServiceId;
            globalVar.dialogId = result.data.dialogId;
            globalVar.msgType = Constants.MSG_TYPE_SERVICE;

            this.inService(Constants.INSERVICE_EMSSAGE);

            // this.addMsg([{
            //     service: true,
            //     message: result.data.welcomeWords
            // }]);

        }, errorHandler);
    });

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

/**
 * 点击消息图片弹出modal
 */
function imgModalListener() {
    this.$dom.on('click', '.open-img', (event) => {
        const $img = $(event.currentTarget);
        const src = $img.attr('src');
        const imgDom = mustache.render(imgModalTpl, {
            src
        });
        const imgModal = modal(imgDom, true);
        imgModal.open();
    });
}

function botAnswerRateListener() {
    this.$dom.on('click', '.bot-answer-rate', (event) => {
        const $target = $(event.currentTarget);
        console.log($target.data('msgid'));
        this.dom.find('.bot-appraise').text('已反馈')
    });
}


/**
 * 排队取消按钮监听
 */
function cancelQueueListener() {
    this.$dom.on('click', '.queue .cancel', (event) => {

        // 防重复点击
        if (event.currentTarget.ajaxLoading) return;
        event.currentTarget.ajaxLoading = true;


        $.ajax({
            url: '/IncomingLine/cancelInQueue.htm',
            contentType: 'application/json; charset=utf-8',
            type: 'post',
            data: {
                initSource: '03',
                groupId: globalVar.groupId,
                previousDialogId: globalVar.dialogId
            }
        }).then((res) => {
            this.groupClick = false;
            if (res.resultCode === Constants.AJAX_SUCCESS_CODE && !!res.data.result) {
                const data = res.data;
                globalVar.dialogId = data.currentDialogId;
                globalVar.targetServiceId = data.toUserId;
                globalVar.msgType = data.currentDialogType == 1 ? Constants.MSG_TYPE_BOT : Constants.MSG_TYPE_SERVICE;
                globalVar.queueLength = 0;
                // 修改文字
                const $target = $(event.currentTarget);
                const $dialog = $target.parent('.dialog');
                $dialog.text(Constants.TEXT_CANCEL_QUEUE);
                return true;
            }
            return false;
        });
    });
}

/**
 * 添加排队消息
 */
function addLine(num) {
    let $queueDom;
    if (!!num) {
        this.$queueDom = $queueDom = this.addMsg({
            queue: true,
            number: num
        });
    }
    queueInterval.call(this, $queueDom);
}

/**
 * 重复请求剩余对列长度
 * @param {*} timeout
 */
function queueInterval($dom, timeout = 30000) {
    if (!$dom) {
        timeout = 0;
    }
    setTimeout(() => {
        service.queryQueueLenght().then((result) => {
            let data = result.data;
            if (!$dom) {
                $dom = this.addMsg({
                    queue: true,
                    number: data.length
                });
                this.$queueDom = $dom;
            } else if (data.length > 0 && globalVar.queueLength > 0) {
                $dom.find('.queue-num').text(data.length);
                queueInterval($dom);
            }

        });
    }, timeout);

}
