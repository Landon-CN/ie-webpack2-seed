/**
 * 2017-7-20
 * @file 机器人v2 解析插件
 * @author jrliuyang5
 */

import * as Constants from './talkConstants';

export default function contentParse(content) {

    try {
        content = JSON.parse(content);
    } catch (e) {
        console.error(e);
        return false;
    }

    if (content.result === false) {
        console.log('机器人接口调用失败', content);
        return false;
    }


    content = content.data;
    let answers;
    try {
        answers = JSON.parse(content.answerModel.answers);
    } catch (e) {
        console.error(e);
        return false;
    }

    switch (content.renderType) {
        case 'render_plain_text':
            return {
                type: Constants.BOT_MESSAGE_TEXT,
                msgType: Constants.INTERACTION_TEXT,
                answer: answers.answer,
                title: answers.title,
                msgId: content.msgId,
                list: [],
                scene: answers.scene
            }
        case 'render_fold_answer':
            return {
                type: Constants.BOT_MESSAGE_FLOD,
                answer: answers.answer || answers.title,
                msgType: Constants.INTERACTION_NORMAL_SELECT,
                title: answers.title,
                msgId: content.msgId,
                list: answers.more,
                scene: answers.scene
            }
        case 'render_user_suggestion':
            return {
                type: Constants.BOT_MESSAGE_SUGGESTION,
                answer: answers.answer || answers.title,
                msgType: Constants.INTERACTION_FEEDBACK_SELECT,
                title: answers.title,
                msgId: content.msgId,
                list: answers.more,
                scene: answers.scene
            }
        default:
            return false;
    }
}

/*
let t2 = {
    "answer": "<p><span style=\"font-size: 16px; font-family: 微软雅黑;\">这是置顶的第一个问题</span><br/></p>",
    "id": "165111558",
    "scene": "ask",
    "score": 0,
    "title": "hzy白条置顶1",
    "type": "answer"
}
let render_plain_text = {
    result: true, // 调用失败
   data:{
    "answerModel": {
        "answerModelProperties": {
            "engineerRenderType": "render_plain_text",
            "replyType": "answer",
            "scene": "ask",
            "sceneItem": "165111558"
        },
        "answers": ""
    },
    "msgId": "ec169131-5aa4-4234-9446-cdd0a9294c20",
    "renderType": "render_plain_text",
    "requestNo": "9851a29d-4468-4ab3-8998-74173a9a8b03",
    "requestTime": 1499651331939,
    "responseTime": 1499651332214,
    "sessionId": "ac213c93-d71b-4119-b3ea-86bd96efc807",

}}

let t1 = {
    "answer": "<span style=\"font-family:微软雅黑;font-size:14px;\">有，若任务失败，请确保照片清晰、网络环境良好再次尝试，每天最多可尝试3次。同时提示您不要频繁操作，一个月最多尝试激活两次。</span>",
    "id": "165111635",
    "more": [{
        "id": "165111750",
        "score": 0,
        "title": "白条可以分几期付款"
    }, {
        "id": "165111691",
        "score": 0,
        "title": "激活白条时，运营商密码错误怎么"
    }, {
        "id": "165111597",
        "score": 0,
        "title": "白条激活失败怎么"
    }, {
        "id": "165111907",
        "score": 0,
        "title": "白条联名卡如何申请"
    }],
    "scene": "ask",
    "score": 0,
    "title": "激活白条人脸识别有次数限制吗",
    "type": "fold"
}
let render_fold_answer = {
    "answerModel": {
        "answerModelProperties": {
            "engineerRenderType": "render_fold_text",
            "replyType": "fold",
            "scene": "ask"
        },
        "answers": ""
    },
    "msgId": "f224307c-9228-41db-8744-3fbceaa7a87f",
    "renderType": "render_fold_text",
    "requestNo": "d2f4f758-b733-433a-8696-e0ea19b74885",
    "requestTime": 1499667106815,
    "responseTime": 1499667109689,
    "sessionId": "d19b267e-7a76-4f68-8485-bc38751f402d"
}
let t3 = {
    "more": [{
        "id": "165111635",
        "score": 0,
        "title": "激活白条人脸识别有次数限制吗"
    }, {
        "id": "165111750",
        "score": 0,
        "title": "白条可以分几期付款"
    }, {
        "id": "165111691",
        "score": 0,
        "title": "激活白条时，运营商密码错误怎么"
    }, {
        "id": "165111597",
        "score": 0,
        "title": "白条激活失败怎么"
    }, {
        "id": "165111907",
        "score": 0,
        "title": "白条联名卡如何申请"
    }],
    "scene": "ask",
    "score": 0,
    "title": "建议问题",
    "type": "suggest"
}
let render_user_suggestion = {
    "answerModel": {
        "answerModelProperties": {
            "engineerRenderType": "render_user_suggestion",
            "replyType": "suggest",
            "scene": "ask"
        },
        "answers": ""
    },
    "msgId": "268a4ca3-acd0-4fc9-8e66-ea74f303a7c6",
    "renderType": "render_user_suggestion",
    "requestNo": "09fb1504-36aa-49b4-a744-5e1bc95f16e0",
    "requestTime": 1499666109437,
    "responseTime": 1499666112368,
    "sessionId": "bc096698-ad39-4a52-85f0-f05918a65a81"
}
*/
export const plain = {
    "answerModel": {
        "answerModelProperties": {
            "engineerRenderType": "render_plain_text",
            "replyType": "answer",
            "scene": "ask",
            "sceneItem": "165111558"
        },
        "answers": "{\"answer\":\"<p><span style=\\\"font-size: 16px; font-family: 微软雅黑;\\\">这是置顶的第一个问题</span><br/></p>\",\"id\":\"165111558\",\"scene\":\"ask\",\"score\":0.0,\"title\":\"hzy白条置顶1\",\"type\":\"answer\"}"
    },
    "msgId": "ec169131-5aa4-4234-9446-cdd0a9294c20",
    "renderType": "render_plain_text",
    "requestNo": "9851a29d-4468-4ab3-8998-74173a9a8b03",
    "requestTime": 1499651331939,
    "responseTime": 1499651332214,
    "sessionId": "ac213c93-d71b-4119-b3ea-86bd96efc807"
}

export const fold = {
    "answerModel": {
        "answerModelProperties": {
            "engineerRenderType": "render_fold_text",
            "replyType": "fold",
            "scene": "ask"
        },
        "answers": "{\"answer\":\"<span style=\\\"font-family:微软雅黑;font-size:14px;\\\">有，若任务失败，请确保照片清晰、网络环境良好再次尝试，每天最多可尝试3次。同时提示您不要频繁操作，一个月最多尝试激活两次。</span>\",\"id\":\"165111635\",\"more\":[{\"id\":\"165111750\",\"score\":0.0,\"title\":\"白条可以分几期付款\"},{\"id\":\"165111691\",\"score\":0.0,\"title\":\"激活白条时，运营商密码错误怎么\"},{\"id\":\"165111597\",\"score\":0.0,\"title\":\"白条激活失败怎么\"},{\"id\":\"165111907\",\"score\":0.0,\"title\":\"白条联名卡如何申请\"}],\"scene\":\"ask\",\"score\":0.0,\"title\":\"激活白条人脸识别有次数限制吗\",\"type\":\"fold\"}"
    },
    "msgId": "f224307c-9228-41db-8744-3fbceaa7a87f",
    "renderType": "render_fold_text",
    "requestNo": "d2f4f758-b733-433a-8696-e0ea19b74885",
    "requestTime": 1499667106815,
    "responseTime": 1499667109689,
    "sessionId": "d19b267e-7a76-4f68-8485-bc38751f402d"
}

export const suggest =  [{
            "channels": ["hello"],
            "content": "{\"data\":{\"answerModel\":{\"answerModelProperties\":{\"engineerRenderType\":\"render_user_suggestion\",\"replyType\":\"suggest\",\"scene\":\"ask\",\"toMan\":false},\"answers\":\"{\\\"more\\\":[{\\\"id\\\":\\\"800219\\\",\\\"score\\\":0.6495274098697531,\\\"title\\\":\\\"白条激活\\\"},{\\\"id\\\":\\\"800220\\\",\\\"score\\\":0.6317176200434012,\\\"title\\\":\\\"白条消费\\\"},{\\\"id\\\":\\\"800223\\\",\\\"score\\\":0.6294584388969316,\\\"title\\\":\\\"白条催收\\\"},{\\\"id\\\":\\\"800222\\\",\\\"score\\\":0.617052496681011,\\\"title\\\":\\\"白条退款\\\"},{\\\"id\\\":\\\"800221\\\",\\\"score\\\":0.6167268561026664,\\\"title\\\":\\\"白条还款\\\"},{\\\"id\\\":\\\"800218\\\",\\\"score\\\":0.6141201479678945,\\\"title\\\":\\\"白条账户\\\"}],\\\"scene\\\":\\\"ask\\\",\\\"score\\\":0.0,\\\"title\\\":\\\"建议问题\\\",\\\"type\\\":\\\"suggest\\\"}\"},\"msgId\":\"cdc11ef4-074f-413e-938e-3b61e243b365\",\"renderType\":\"render_user_suggestion\",\"requestInteractionType\":\"request_text\",\"requestNo\":\"d89ac2e8-f383-4eb0-b36d-bbbe9ce90eef\",\"requestTime\":1502100727887,\"responseTime\":1502100728000,\"sessionId\":\"c4ae8ccf-71f3-4ab1-a1a0-5f79c9ebd5d3\"},\"result\":true,\"terminalType\":\"pc\"}",
            "dialogId": "59883a3930ee5916e8e51334",
            "fromUserId": "10001",
            "fromUserName": "机器人小京",
            "msgId": "0121007278859830",
            "offline": false,
            "packetId": "0",
            "sendTime": "2017-08-07 18:12:07",
            "timeout": 0,
            "toUserId": "110020000000114697",
            "toUserName": "perftest001/01",
            "type": "43",
            "ws": "lpool"
        }]
