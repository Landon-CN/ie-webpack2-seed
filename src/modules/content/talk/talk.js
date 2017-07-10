import tpl from './talk.html';
import msgTpl from './message.html';
import mustache from 'mustache';
import $ from 'jquery';
import './talk.less';

import {
    emoji as Emoji,
    getImgSrcById
} from 'components/emoji/emoji';
import Appraise from './appraise/appraise';
import moment from 'moment';
import {
    headerChangeToSerice
} from '../../header/header';
import globalVar from 'globalVar';
import * as service from './talkService';
import line from './line/line';

const botId = globalVar.botId;
const msgText = {
    botHelloMsg: '亲爱的京东金融用户，金融小M智能机器人很高兴为您服务！',
    serviceError: '系统开小差啦~让小M在为您服务一会吧~',
    reconnect: '上次聊到这里',
    serviceSuccess: '京东金融客服很高兴为您服务',
    isRate: '您已经评价过了',
    close: '本次会话已结束'
}

const defaultText = '请描述您遇到的问题~';
const placeholderClassName = 'placeholder';
// 默认对话机器人
globalVar.targetServiceId = botId;

let dom, historyDom, msgBox, scroll;
let onlineClick = false;
export default function (parent) {
    dom = $(mustache.render(tpl, {}));

    let emoji = Emoji(dom.find('.toolbar'), emojiChange);
    let appraise = Appraise(dom.find('.toolbar'), true);

    let inputBox = dom.find('.input-box');
    msgBox = dom.find('.message-box');
    let keyType = 'one';
    scroll = dom.find('.scroll');
    let pageSize = 10;
    historyDom = dom.find('.history-msg');
    let rateTooltip = dom.find('.rate-tooltip');

    let lineModal = line(() => {

    });


    let msgType = '3';

    dom.on('click', '.tool-item', function (event) {
        event.stopPropagation();
        const type = $(this).data('type');
        closeOther(type);
        rateTooltip.hide();
        switch (type) {
            case 'emoji':
                emoji.toggle();
                break;
            case 'rate':
                appraise.toggle();
                break;
            default:
                break;
        }
    });

    // 邀请评价
    dom.on('click', '.open-rate', (event) => {

        event.stopPropagation();
        addAppraise();
    });

    // 添加评价
    function addAppraise() {
        let dom = addMsg({
            service: true,
            date: Date.now()
        });

        Appraise(dom.find('.message-text'), undefined, submitRateCallback).open();
    }


    const imgReg = /(\.|\/)(gif|jpe?g|png)$/i;
    dom.find('.fileinput-button').fileupload({
        pasteZone: inputBox,
        dropZone: $(document),
        maxFileSize: '5000000',
        dataType: 'json',
        url: '/webpage/file/upload.htm',
        acceptFileTypes: imgReg,
        done: function (e, result) {

            let data = result.result.data[0];
            let url = data.url;
            let msg = `<img src='${url}'>`;
            // service.sendMsg(globalVar.targetServiceId, {
            //     content: stringifyContent(msg)
            // }).then(() => {
            // addMsg({
            //     user: true,
            //     message: msg
            // });
            inputBoxPlaceholderJudge(inputBox);
            inputBox.append(msg);
            // });
        }
    });

    dom.on('click', '.btn-more', function (event) {
        event.stopPropagation();
        dom.find('.submit-type').toggle();
    });

    $(document).on('click', function () {
        dom.find('.submit-type').hide();
        closeOther();
    });

    // 处理输入框快捷键
    dom.on('keydown', '.input-box', function (event) {
        const keyCode = event.keyCode;

        if (keyCode === 13) {
            event.preventDefault();
        }


        if (keyType === 'one' && keyCode === 13 && event.ctrlKey) {

            addBr();
            event.preventDefault();
        } else if (keyType === 'two' && keyCode === 13 && !event.ctrlKey) {
            addBr();
        }

        if (keyType === 'one' && keyCode === 13 && !event.ctrlKey) {
            submit();
            event.preventDefault();
        } else if (keyType === 'two' && keyCode === 13 && event.ctrlKey) {
            submit();
        }
    });

    dom.on('click', '.btn-submit', function (event) {
        submit();
    });

    //提交消息
    function submit() {
        let htmlText = inputBox.html();
        if (htmlText == '' || htmlText == defaultText) {
            return;
        }

        inputBox.html('');
        htmlText = $(`<div>${htmlText}</div>`);
        htmlText.find('.remove').remove()
        htmlText = htmlText.html();

        let content = stringifyContent(htmlText);

        // 有消息才发送
        if (content && !globalVar.isClose) {
            service.sendMsg(globalVar.targetServiceId, {
                content
            });
        }

        if (globalVar.isClose) {
            onlineClick = false;
            onlineServiceClick();
        }

        addMsg({
            user: true,
            message: htmlText
        });
    }

    function submitRateCallback() {
        rateTooltip.hide();
    }

    // 添加换行
    function addBr() {
        try {
            document.execCommand("insertHTML", false, "<br /><br />")
        } catch (e) {
            if (document.selection) {
                const range = document.selection.createRange();
                range.pasteHTML('<br /><br class=\'remove\' />')
            }
        }
    }

    dom.on('click', '.submit-type >span', function () {
        keyType = $(this).data('type');
        dom.find('.reminder').text($(this).text());
    });

    // 结束对话
    dom.on('click', '.btn-close', function name() {
        window.location.href = "about:blank";
    });

    // 选择问题分组
    // 有且只能点一次
    let groupClick = false;

    dom.on('click', '.service-group > li', function (event) {
        if (groupClick) {
            return;
        }

        groupClick = true;
        let id = $(this).data('id');
        globalVar.groupId = id;
        $(this).find('.group-name').addClass('active');
        service.queryServiceId(id).then((result) => {
            let customerServiceId = result.data.customerServiceId;
            globalVar.isClose = false;
            if (!customerServiceId) {
                // 要排队
                lineModal.change(result.data.queueLength);
                return lineModal.open();
            }

            globalVar.targetServiceId = customerServiceId;
            globalVar.dialogId = result.data.dialogId;

            // 进线成功删除和机器人聊天记录
            dom.find('.message-row').remove();
            inService(msgText.serviceSuccess);

            addMsg([{
                service: true,
                message: result.data.welcomeWords
            }]);

        }, () => {
            groupClick = false;
            addMsg([{
                dialog: true,
                message: msgText.serviceError
            }]);
        });
    });
    // 点击状态
    let noMorePage = false,
        pageLoading = false,
        backMsg = '',
        historyTime = moment();
    dom.on('click', '.history-msg', getHistory);

    function getHistory() {
        // debugger;
        if (noMorePage || pageLoading) {
            return;
        }
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
                    message: parseContent(item.content),
                    time: item.sendTime
                });
            }

            addMsg(msgList, false);
        }, function (event) {
            historyDom.text(backMsg)
        });
    }

    // 表情包选中
    function emojiChange(src, id) {
        const img = document.createElement('img');

        $(img).attr({
            src,
            'data-type': 'e',
            'data-s': 's' + id
        });
        addEmoji(inputBox, img);
    }

    // 关闭其他弹窗
    function closeOther(type) {
        if (type !== 'emoji') {
            emoji.close();
        }

        if (type !== 'rate') {
            appraise.close();
        }

    }

    $(parent).append(dom);


    // 建立长连接
    function pollInterval(params) {
        service.pollMsg().then(function (result) {
            let data = result.data;

            // 重新建立长连接
            if (data.data && data.data === 'dying') {
                return pollInterval();
            }

            if (data.channel === 'hello') {
                resolveMsg(data.data)
            }

            pollInterval();


        }, () => {

            // 错误，5s后尝试重新连接
            setTimeout(function () {
                pollInterval();
            }, 5000);

        });
    }
    // 每隔25S拉去一次离线消息
    const offlineTimeout = 25000;

    function offlineMsgInteval() {
        setTimeout(function () {
            service.getOfflineMsg().then((result) => {
                if (result.data.length > 0) {
                    resolveMsg(result.data);
                }
                offlineMsgInteval();
            });
        }, offlineTimeout);
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
                addAppraise();
                break;
            }

            if (item.type == 7) {
                // 结束会话
                globalVar.targetServiceId = globalVar.botId;
                globalVar.isRate = false;
                globalVar.groupId = null;
                globalVar.dialogId = null;
                globalVar.isClose = true;
                groupClick = false;
                addMsg({
                    dialog: true,
                    message: msgText.close,
                    time: moment()
                });
                break;
            }

            // 排队进线成功
            if (item.type == 6) {
                globalVar.targetServiceId = item.fromUserId;
                lineModal.close();
                globalVar.isClose = false;
                inService(msgText.serviceSuccess);
                break;
            }

            // 真人客服需要消息回执
            if (item.type == 2) {
                service.msgReceipt({
                    msgId: item.id || item.msgId,
                    toUserId: globalVar.targetServiceId,
                    packetId: item.packetId
                })
            }

            msgList.push({
                service: true,
                message: parseContent(item.content),
                time: item.sendTime
            });
        }
        addMsg(msgList);
    }

    dom.on('mouseenter', '.rate-tool', () => {
        if (globalVar.isRate) {
            rateTooltip.find('.text').text(msgText.isRate);
            rateTooltip.show();
        }

    });

    dom.on('mouseleave', '.rate-tool', () => {
        if (globalVar.isRate) {
            rateTooltip.hide();
        }
    });

    dom.on('click', '.rate-tooltip .close', () => {
        dom.find('.rate-tooltip').hide();
    });

    // 进线
    function inService(message) {
        onlineClick = true; //防止再次进线
        headerChangeToSerice();
        onlineServiceShow(dom);

        addMsg({
            dialog: true,
            message,
            time: moment()
        });
    }

    function init() {
        offlineMsgInteval();
        pollInterval();
        // 上次处于进线状态
        service.getServiceList().then((result) => {
            let message = msgText.botHelloMsg;
            if (result.data.continuePreviousDialog) {
                globalVar.targetServiceId = result.data.customerServiceId;
                globalVar.dialogId = result.data.previousDialogId;


                return getHistory().then(() => {
                    inService(msgText.reconnect);
                });
            }

            if (result.data.queueLength > 0) {
                globalVar.groupId = result.data.previousGroupId;
                lineModal.change(result.data.queueLength);
                lineModal.open();
            }

            // 添加默认对话
            setTimeout(function () {
                addMsg({
                    service: true,
                    message,
                    time: moment()
                });
            }, 100);
        });
    }
    init();
    inputBoxPlaceholder(dom);

    $(window).on('resize', resize);

    function resize() {
        let height = $('.talk-editor').height();

        $('.input-box').outerHeight(height - 70 - 10);
    }
    setTimeout(function () {
        resize();
    }, 0);

    // 处理粘贴富文本
    // inputBox.on('paste', (e) => {

    //     let text;

    //     if (window.clipboardData && clipboardData.setData) {
    //         // IE
    //         text = window.clipboardData.getData('text');
    //     } else {
    //         text = (e.originalEvent || e).clipboardData.getData('text/plain');
    //     }
    //     if (text) {
    //         e.preventDefault();
    //         if (document.body.createTextRange) {
    //             if (document.selection) {
    //                 textRange = document.selection.createRange();
    //             } else if (window.getSelection) {
    //                 sel = window.getSelection();
    //                 var range = sel.getRangeAt(0);

    //                 // 创建临时元素，使得TextRange可以移动到正确的位置
    //                 var tempEl = document.createElement("span");
    //                 tempEl.innerHTML = "&#FEFF;";
    //                 range.deleteContents();
    //                 range.insertNode(tempEl);
    //                 textRange = document.body.createTextRange();
    //                 textRange.moveToElementText(tempEl);
    //                 tempEl.parentNode.removeChild(tempEl);
    //             }
    //             textRange.text = text;
    //             textRange.collapse(false);
    //             textRange.select();
    //         } else {
    //             // Chrome之类浏览器
    //             document.execCommand("insertText", false, text);
    //         }
    //     }
    // });

}

// 消息体解析
function parseContent(xml) {

    if (xml.indexOf('<') != 0) {
        return xml;
    }
    let msgBody = $(xml);

    let htmlStr = '';
    msgBody.each((index, element) => {
        let nodeName = element.nodeName.toLowerCase();
        element = $(element);
        switch (nodeName) {
            case '#text':
                htmlStr += element.text();
                break;
            case 'br':
                htmlStr += '<br/>';
                break;
            case 'e':
                let src = getImgSrcById(element.attr('s'));
                htmlStr += `<img src='${src}' />`;
                break;
            case 'img':
                htmlStr += `<a href="${element.attr('src')}" target="_blank"><img src='${element.attr('src')}' /></a>`
                break;
            default:
                break;
        }
    });
    return htmlStr;
}

// 消息解析为xml
function stringifyContent(html) {
    let htmlStr = '';

    if (globalVar.targetServiceId === botId) {
        return $(`<body>${html}</body>`).text();
    }

    $(`<body>${html}</body>`).each((index, element) => {
        let nodeName = element.nodeName.toLowerCase();
        element = $(element);
        switch (nodeName) {
            case 'br':
                htmlStr += '<br/>';
                break;
            case 'img':
                if (element.data('type'))
                    htmlStr += `<e t="d" s="${element.data('s')}" />`;
                else
                    htmlStr += `<img src='${element.attr('src')}' />`
                break;
            case '#text':
            default:

                htmlStr += encode(element.text());
                break;
        }
    });


    return `<body>${htmlStr}</body>`


}

function encode(str) {
    str = str.replace(/&/g, '&amp;');
    str = str.replace(/</g, '&lt;');
    str = str.replace(/>/g, '&gt;');
    str = str.replace(/"/g, '&quot;');
    return str;
}

/**
 * 输入框的placehloder
 * @param {*} dom
 */
function inputBoxPlaceholder(dom) {

    let inputBox = dom.find('.input-box');
    inputBox.addClass(placeholderClassName);
    inputBox.text(defaultText);
    inputBox.on('focus', () => {

        inputBoxPlaceholderJudge(inputBox);
        dom.find('.rate-tooltip').hide();
    });
    inputBox.on('blur', () => {
        if (inputBox.html() == '') {
            inputBox.addClass(placeholderClassName);
            inputBox.text(defaultText);
        }
    });
}

// 判断是否placeholder需要删除
function inputBoxPlaceholderJudge(inputBox) {
    if (inputBox.html() == defaultText) {
        inputBox.removeClass(placeholderClassName);
        inputBox.text('');
    }
}

/**
 * 添加表情
 * @param {*} emoji
 */
function addEmoji(inputBox, emoji) {
    inputBoxPlaceholderJudge(inputBox)

    inputBox.append(emoji);
}


// 进线成功后，显示某些元素
function onlineServiceShow(dom) {
    // 显示图片上传和评价按钮
    dom.find('.rate-tool,.fileinput-button').css('display', 'inline-block');

    // 如果已评价，则不提示
    !globalVar.isRate && dom.find('.rate-tooltip').show();

    // 显示历史记录按钮
    historyDom.show();
}


const onlineServiceClick = function () {

    if (onlineClick) {
        return;
    }
    onlineClick = true;

    service.getServiceList().then(function (result) {
        const data = result.data;
        const list = data.showBusinessInfo.sort((a, b) => a.groupId > b.groupId);
        addMsg({
            serviceGroup: true,
            serviceList: list,
            time: moment()
        });
    });

};


// 添加消息

// 提前缓存
mustache.parse(msgTpl);
let lastTime;
const intervalTime = 5 * 60 * 1000; // 间隔5分钟以上才会显示时间条
const previousDayTime = [];
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
        msgBox.append(dom);
        scroll.scrollTop(msgBox.height());
    } else {
        historyDom.after(dom);
    }

    return dom;
}

export {
    onlineServiceClick,
    addMsg
}
