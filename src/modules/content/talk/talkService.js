import jquery from 'jquery';
import globalVar from 'globalVar';
import moment from 'moment';

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
export function historyMsg(data) {

    data.userA = globalVar.targetServiceId;
    data.userB = globalVar.userId;
    data.msgType = globalVar.targetServiceId === globalVar.botId ? 3 : 2;
    return $.ajax({
        url: '/webpage/records/get.htm',
        contentType: 'application/json; charset=utf-8',
        type: 'post',
        data
    })
}

// 查询客服ID
export function queryServiceId(groupId) {
    return $.ajax({
        type: 'post',
        url: '/IncomingLine/selectCustomerServiceInGroup.htm',
        contentType: 'application/json; charset=utf-8',
        data: {
            groupId,
            initSource: '03'
        }
    });
}

// 长轮训10S
export function pollMsg() {
    return $.ajax({
        type: 'post',
        timeout: 60000,
        contentType: 'application/json; charset=utf-8',
        url: `/message/conn?type=conn&time=${Date.now()}`
    });
}

// 获取离线消息
export function getOfflineMsg(params) {
    return $.ajax({
        type: 'post',
        url: '/message/offlinemsg/get.htm',
        contentType: 'application/json; charset=utf-8',
        dataType: 'json'
    });
}

// 发送消息
export function sendMsg(targetUserId, data) {
    data.time = moment().format('YYYY-MM-DD HH:mm:SS');

    data.type = globalVar.targetServiceId == globalVar.botId ? 3 : 2;
    data.dialogId = globalVar.dialogId;
    console.log('发送消息==>',data.content);

    return $.ajax({
        url: `/message/onlinemsg/send.htm?targetUserId=${targetUserId}`,
        type: 'post',
        contentType: 'application/json; charset=utf-8',
        data
    });
}

// 获取分组列表
export function getServiceList(data = {
    source: '03'
}) {
    return $.ajax({
        type: 'post',
        url: '/IncomingLine/selectShownBusiness.htm',
        contentType: 'application/json; charset=utf-8',
        data,
    });
}

/**
 * 消息回执
 * @param {*} params
 * "msgId": "asdf", //消息ID
 * "toUserId": "10231233111", //对方用户ID
 * "packetId": "322345" //包ID，用户PC端
 */
export function msgReceipt(params) {
    return $.ajax({
        type: 'post',
        url: '/message/ack/handler.htm',
        contentType: 'application/json; charset=utf-8',
        data: {
            msgId: params.msgId,
            toUserId: params.toUserId,
            packetId: params.packetId
        }
    });
}
