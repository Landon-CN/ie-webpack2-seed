import jquery from 'jquery';
import {
    content,
    header
} from './modules';
import globalVar from 'globalVar';
import {
    postFrom
} from './utils';
import * as Constants from './modules/content/talk/talkConstants';
import botParse from './modules/content/talk/botContentParse';

function keyInit() {

    return jquery.ajax({
        url: '/message/login/key.htm',
        type: 'post',
        contentType: 'application/x-www-form-urlencoded; charset=utf-8',
        noParse: true,
        data: `webUniqueKey=${globalVar.uuid}`
    }).then((result) => {
        globalVar.jdPin = result.data.jdPin;
        globalVar.webPersonalKey = result.data.webPersonalKey;
        globalVar.userId = result.data.userId;
    })

}

function inlineInit() {
    return jquery.ajax({
        url: '/IncomingLine/incomingLine.htm',
        type: 'post',
        contentType: 'application/json; charset=utf-8',
        noParse: true,
        data: {
            initSource: '03'
        }
    }).then((result) => {
        // 1 是机器人 2是人
        /* {
            "msg": "操作成功",
            "data": {
                "currentDialogId": "5976a64fccb8912c7499f9ee",
                "currentDialogType": "1",
                "toUserId": "10001"
            },
            "resultCode": "00000"
        } */
        /* {
            "msg": "操作成功",
            "data": {
                "content": "{\"answerModel\":{\"answerModelProperties\":{\"engineerRenderType\":\"render_plain_text\",\"replyType\":\"\",\"scene\":\"common\",\"sessionId\":\"2989d8bd-1fd3-4ee4-8ece-c7f8b62b00e0\",\"toMan\":false},\"answers\":\"{\\\"answer\\\":\\\"上午好，现在是2017-07-25 10:00:43，京东金融很高兴为您服务\\\",\\\"scene\\\":\\\"common\\\",\\\"score\\\":0.0,\\\"title\\\":\\\"欢迎语\\\",\\\"type\\\":\\\"render_plain_text\\\"}\"},\"msgId\":\"2c5e3192-64bd-4868-8e39-33336a8f6b15\",\"renderType\":\"render_plain_text\",\"requestNo\":\"de7195d5-4a4d-45fe-bb7f-a3afa43d13f8\",\"requestTime\":1500948044441,\"responseTime\":1500948043975,\"sessionId\":\"2989d8bd-1fd3-4ee4-8ece-c7f8b62b00e0\"}",
                "currentDialogId": "5976a64fccb8912c7499f9ee",
                "currentDialogType": "1",
                "toUserId": "10001"
            },
            "resultCode": "00000"
        } */
        const data = result.data;
        globalVar.dialogId = data.currentDialogId;
        globalVar.targetServiceId = data.toUserId;
        globalVar.msgType = data.currentDialogType == 1 ? Constants.MSG_TYPE_BOT : Constants.MSG_TYPE_SERVICE;
        if (data.content) {
            let botContent = botParse(data.content);
            globalVar.welcomeWords = botContent.answer;
        }

    });
}



function domInit() {
    header('.body-content');
    content('.body-content');
}

function init() {
    jquery.when(keyInit(), inlineInit()).then(() => {
        domInit();
    });
}



export default init;
