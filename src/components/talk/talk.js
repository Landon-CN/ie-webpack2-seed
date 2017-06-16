const tpl = __inline('./talk.html');
const msgTpl = __inline('./message.html');
const mustache = window.Mustache;
const botId = '10001';

window.components.talk = function (parent) {
    const dom = $(mustache.render(tpl, {}));

    let emoji = components.emoji(dom.find('.toolbar'), emojiChange);
    let appraise = components.appraise(dom.find('.toolbar'));
    let inputBox = dom.find('.input-box');
    let msgBox = dom.find('.message-box');
    let keyType = 'one';
    let scroll = dom.find('.scroll');


    // 默认对话机器人
    window.targetServiceId = botId;
    let msgType = '3';

    dom.on('click', '.tool-item', function (event) {
        event.stopPropagation();
        const type = $(this).data('type');
        closeOther(type);
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




    dom.find('.fileinput-button').fileupload({
        dataType: 'json',
        url: '/webpage/file/upload.htm',
        done: function (e, result) {
            let data = result.result.data[0];
            let url = data.url;
            let msg = `<img src='${url}'>`;
            addMsg({
                user: true,
                message: msg
            });
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
        } else if (keyType === 'two' && keyCode === 13 && !event.ctrlKey) {
            addBr();
        }

        if (keyType === 'one' && keyCode === 13 && !event.ctrlKey) {
            submit();
        } else if (keyType === 'two' && keyCode === 13 && event.ctrlKey) {
            submit();
        }

    });

    dom.on('click', '.btn-submit', function (event) {
        submit();
    });

    //提交消息
    function submit() {
        let html = inputBox.html();
        inputBox.html('');
        sendMsg(targetServiceId, {
            type: msgType,
            content: stringifyContent(html)
        });
        addMsg({
            user: true,
            message: html
        })
    }

    // 添加换行
    function addBr() {
        try {
            document.execCommand("insertHTML", false, "<br/>")
        } catch (e) {
            if (document.selection) {
                const range = document.selection.createRange();
                range.pasteHTML('<br />')
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
        $(this).find('.group-name').addClass('active');
        queryServiceId(id).then((result) => {
            targetServiceId = result.data.customerServiceId;
            components.dialog.open('人工客服连接成功')
        });
    });

    // 表情包选中
    function emojiChange(src, id) {
        const img = document.createElement('img');

        $(img).attr({
            src,
            'data-type': 'e',
            'data-s': 's' + id
        })
        inputBox.append(img);
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

    // 添加消息

    // 提前缓存
    mustache.parse(msgTpl);
    let lastTime;
    let intervalTime = 5 * 60 * 1000; // 5分钟
    function addMsg(data) {
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
            let time = moment(item.time);
            // console.log(time - lastTime)
            if (!lastTime || time - lastTime > intervalTime) {
                lastTime = time;
                data.list.splice(i, 0, {
                    timeShow: true,
                    message: lastTime.format('HH:mm')
                });
            }

        }
        // console.log(data);

        const serviceListHtml = mustache.render(msgTpl, data);
        let dom = $(serviceListHtml);
        msgBox.append(dom);



        scroll.scrollTop(msgBox.height());
        return dom;
    }

    let onlineClick = false;
    window.onlineServiceClick = function () {

        if (onlineClick) {
            return;
        }
        onlineClick = true;

        getServiceList().then(function (result) {
            const data = result.data;
            const list = data.showBusinessInfo;
            addMsg({
                serviceGroup: true,
                serviceList: list,
                time: moment()
            });
        });
    }

    $(parent).append(dom);


    // 添加默认对话
    setTimeout(function () {
        addMsg({
            service: true,
            message: '欢迎来到京东金融智能客服，请输入您遇到的问题',
            time: moment()
        });
    }, 500);

    // 建立长连接
    function pollInterval(params) {
        pollMsg().then(function (result) {
            let data = result.data;

            // 重新建立长连接
            if (data.data && data.data === 'dying') {
                return pollInterval();
            }

            if (data.channel === 'hello') {
                let resData = data.data;
                let msgList = [];
                for (let i = 0; i < resData.length; i++) {
                    let item = resData[i];

                    msgList.push({
                        service: true,
                        message: parseContent(item.content),
                        time: item.sendTime
                    });
                }
                addMsg(msgList);
            }



            pollInterval();



        }, () => {

            // 错误，5s后尝试重新连接
            setTimeout(function () {
                pollInterval();
            }, 5000);

        });
    }
    pollInterval();

    // 每隔25S拉去一次离线消息
    const offlineTimeout = 25000;

    function offlineMsgInteval() {
        setTimeout(function () {
            getOfflineMsg().then((result) => {
                let data = result.data;
                // data = [{
                //     "msgId": "23", //String，消息唯一Id
                //     "msgType": "3", //String，消息类型
                //     "groupId": "68", //String，消息群组ID，暂时不用
                //     "fromUser": "4235234524511", //String，发送者
                //     "fromUserName": "wucong12", //String，发送者
                //     "toUser": "123412341234123", //String，接受者
                //     "toUserName": "jiege", //String，接受者
                //     "sendTime": "2012-02-03 12:21:35", //String，发送时间
                //     "content": `

                //         <body>
                //         你好!
                //         <br />
                //         <e t="d" s="s01" />
                //         <img src="http://img10.360buyimg.com/N6/jfs/t5788/320/1292921154/149424/d6173c8b/59253508N6b27ffdb.jpg" />
                //     </body>

                //     `
                // }]
                let msgList = [];
                for (let i = 0; i < data.length; i++) {
                    let item = data[i];
                    msgList.push({
                        service: true,
                        message: parseContent(item.content),
                        time: item.sendTime
                    });
                }

                addMsg(msgList);
                offlineMsgInteval();
            });
        }, offlineTimeout);

    }
    offlineMsgInteval();
}

// 长轮训10S
function pollMsg() {
    return $.ajax({
        type: 'post',
        timeout: 0,
        contentType: 'application/json; charset=utf-8',
        url: `/message/conn?type=conn&time=${Date.now()}`
    });
}

// 获取离线消息
function getOfflineMsg(params) {
    return $.ajax({
        type: 'post',
        url: '/message/offlinemsg/get.htm',
        contentType: 'application/json; charset=utf-8',
        dataType: 'json'
    });
}

// 发送消息
function sendMsg(targetUserId, data) {
    data.time = moment().format('YYYY-MM-DD HH:mm:SS');

    return $.ajax({
        url: `/message/onlinemsg/send.htm?targetUserId=${targetUserId}`,
        type: 'post',
        contentType: 'application/json; charset=utf-8',
        data
    });
}

// 获取分组列表
function getServiceList(data = {
    source: '03'
}) {
    return $.ajax({
        type: 'post',
        url: '/IncomingLine/selectShownBusiness.htm',
        contentType: 'application/json; charset=utf-8',
        data,
    });
}

// 查询客服ID
function queryServiceId(groupId) {
    return $.ajax({
        type: 'post',
        url: '/IncomingLine/selectCustomerServiceInGroup.htm',
        contentType: 'application/json; charset=utf-8',
        data: {
            groupId
        }
    });
}

/**
 * {
        msgType:"01",//消息类型，参照ImmediateMsgTypeEnum。必填项
        userA:"sunyinjie", //用户1的userId，当msgType！=02时，必填。
        userB:"liwei", //用户2的userId，当msgType！=02时，必填。
        groupId:"12545",//群组ID，当msgType==02时，必填。
        pageSize:10,//页面大小
        currentPage:1,//查询页数 
        startDate:起始时间,
        endDate:结束时间
    } 

    ONLINE("1","上线"),
    TALK("2","即时消息"),
    ROBOT_TALK("3","即时消息机器人"),
    FILE("4","文件"),
    OFFLINE("9","下线");
 */
function historyMsg(data) {
    return $.ajax({
        url: '/records/get.htm',
        type: 'post',
        data
    })
}

/**
 * 评价接口
 * @param {*} data 
 
{
    "dialogId": "346437213412", //会话ID
    "toUser": "33333", //目标用户userId
    "toUserName": "xxx", //目标用户
    "fromUser": "110020000000000102", //来源用户userId
    "fromUserName": "shuaidaobaoa", //来源用户
    "sendTime": "2017-06-06 00:00:00", //时间
    "score": "3", //评分
    "reason": "服务态度问题", //缘由，用户点击选择
    "userSay": "太差了", //用户言论
}

 */
function rate(data) {
    return $.ajax({
        url: '/records/get.htm',
        type: 'post',
        data
    })
}

// 消息体解析
function parseContent(xml) {

    if(targetServiceId === botId){
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
                htmlStr += `<img src='imgs/${element.attr('s')}.gif' />`;
                break;
            case 'img':
                htmlStr += `<img src='${element.attr('src')}' />`
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
    if (targetServiceId === botId) {
        return $(`<body>${html}</body>`).text();
    }

    $(`<body>${html}</body>`).each((index, element) => {
        let nodeName = element.nodeName.toLowerCase();
        element = $(element);
        switch (nodeName) {
            case '#text':
                htmlStr += element.text();
                break;
            case 'br':
                htmlStr += '<br/>';
                break;
            case 'img':
                htmlStr += `<e t="d" s="${element.data('s')}" />`;
                break;
            default:
                break;
        }
    });
    return `<body>${htmlStr}</body>`


}