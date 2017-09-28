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

    if (!answers) {
        console.warn('机器人无返回answers');
        return false;
    }
    const answerModelProperties = content.answerModel.answerModelProperties;
    switch (content.renderType) {
        case 'render_plain_text':
            return {
                type: Constants.BOT_MESSAGE_TEXT,
                msgType: Constants.INTERACTION_TEXT,
                answer: answers.answer,
                title: answers.title,
                msgId: content.msgId,
                faqId: answers.id,
                list: [],
                scene: answers.scene,
                needAppraise: answerModelProperties.replyType === 'answer' && answerModelProperties.scene === 'business',
                toMan: answerModelProperties.toMan, // 是否转人工
                toManWay: answerModelProperties.toManWay // 1 自动转人工，2 手动转人工
            };
        case 'render_fold_answer':
            return {
                type: Constants.BOT_MESSAGE_FLOD,
                answer: answers.answer || answers.title,
                msgType: Constants.INTERACTION_NORMAL_SELECT,
                title: answers.title,
                msgId: content.msgId,
                list: answers.more,
                scene: answers.scene
            };
        case 'render_user_suggestion':
            return {
                type: Constants.BOT_MESSAGE_SUGGESTION,
                answer: answers.answer || answers.title,
                msgType: Constants.INTERACTION_FEEDBACK_SELECT,
                title: answers.title,
                msgId: content.msgId,
                list: answers.more,
                scene: answers.scene
            };
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
};

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
};

export const suggest = [{
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
}];


export const testData = {
    "data": {
        "channel": "hello",
        "data": [{
            "channels": ["hello"],
            "content": "{\"data\":{\"answerModel\":{\"answerModelProperties\":{\"engineerRenderType\":\"render_plain_text\",\"replyType\":\"answer\",\"scene\":\"business\",\"sceneItem\":\"8984\",\"sessionId\":\"56\",\"toMan\":false},\"answers\":\"{\\\"id\\\":\\\"8984\\\",\\\"scene\\\":\\\"business\\\",\\\"score\\\":0.0,\\\"title\\\":\\\"京东小金库有哪些用途\\\",\\\"type\\\":\\\"answer\\\"}\"},\"msgId\":\"54\",\"renderType\":\"render_plain_text\",\"requestInteractionType\":\"request_normal_select\",\"requestNo\":\"9c1e7baa-eab8-4c73-995f-ed33c25449f8\",\"requestTime\":1505830875418,\"responseTime\":1505830875434,\"sessionId\":\"56\"},\"result\":true,\"terminalType\":\"pc\"}",
            "dialogId": "59c1275530ee593d0bec161b",
            "fromUserId": "10001",
            "fromUserName": "机器人小京",
            "offline": true,
            "packetId": "0",
            "sendTime": "2017-09-19 22:21:14.888",
            "timeout": 0,
            "toUserId": "110020000000114580",
            "toUserName": "jtalk001/01",
            "type": "43"
        }, {
            "channels": ["hello"],
            "content": "{\"data\":{\"answerModel\":{\"answerModelProperties\":{\"engineerRenderType\":\"render_fold_answer\",\"replyType\":\"fold\",\"scene\":\"business\",\"sceneItem\":\"5595\",\"sessionId\":\"56\",\"toMan\":false},\"answers\":\"{\\\"answer\\\":\\\"可以，白条账户支持关闭。但是白条一旦关闭，不能保证可以再次开通。白条关闭后，您仍能看到白条额度，但在消费时无法使用。\\\",\\\"id\\\":\\\"5595\\\",\\\"more\\\":[{\\\"id\\\":\\\"8891\\\",\\\"scene\\\":\\\"business\\\",\\\"score\\\":76.0,\\\"title\\\":\\\"我的白条额度太低，要注销白条\\\",\\\"type\\\":\\\"fold\\\"},{\\\"id\\\":\\\"8890\\\",\\\"scene\\\":\\\"business\\\",\\\"score\\\":76.0,\\\"title\\\":\\\"我的白条额度太高了，要注销白条\\\",\\\"type\\\":\\\"fold\\\"},{\\\"id\\\":\\\"6102\\\",\\\"scene\\\":\\\"business\\\",\\\"score\\\":76.0,\\\"title\\\":\\\"白条注销是否影响白条闪付消费\\\",\\\"type\\\":\\\"fold\\\"},{\\\"id\\\":\\\"8885\\\",\\\"scene\\\":\\\"business\\\",\\\"score\\\":72.0,\\\"title\\\":\\\"我不小心开通了白条，能注销吗\\\",\\\"type\\\":\\\"fold\\\"}],\\\"scene\\\":\\\"business\\\",\\\"score\\\":80.0,\\\"title\\\":\\\"白条账户是否可以注销\\\",\\\"type\\\":\\\"fold\\\"}\"},\"msgId\":\"55\",\"renderType\":\"render_fold_answer\",\"requestInteractionType\":\"request_text\",\"requestNo\":\"28e8ce4c-7b7a-4ff3-b057-0891d169f676\",\"requestTime\":1505830885599,\"responseTime\":1505830885632,\"sessionId\":\"56\"},\"result\":true,\"terminalType\":\"pc\"}",
            "dialogId": "59c1275530ee593d0bec161b",
            "fromUserId": "10001",
            "fromUserName": "机器人小京",
            "offline": true,
            "packetId": "0",
            "sendTime": "2017-09-19 22:21:25.505",
            "timeout": 0,
            "toUserId": "110020000000114580",
            "toUserName": "jtalk001/01",
            "type": "43"
        }],
        "time": 1505830965027
    },
    "msg": "操作成功",
    "resultCode": "00000"
};

export const block = {
    "data": {
        "channel": "hello",
        "data": [{
            "channels": ["hello"],
            "content": "{\"data\":{\"answerModel\":{\"answerModelProperties\":{\"engineerRenderType\":\"render_plain_text\",\"replyType\":\"unknown\",\"scene\":\"business\",\"sessionId\":\"57\",\"toMan\":false},\"answers\":\"null\"},\"msgId\":\"79\",\"renderType\":\"render_plain_text\",\"requestInteractionType\":\"request_text\",\"requestNo\":\"0e428dce-ce58-47b3-b951-ee3da1f31445\",\"requestTime\":1505832507304,\"responseTime\":1505832507341,\"sessionId\":\"57\"},\"result\":true,\"terminalType\":\"pc\"}",
            "dialogId": "59c12a2930ee593d0bec161c",
            "fromUserId": "10001",
            "fromUserName": "机器人小京",
            "msgId": "0158325072988332",
            "offline": false,
            "packetId": "0",
            "sendTime": "2017-09-19 22:48:26.545",
            "timeout": 0,
            "toUserId": "110020000000114887",
            "toUserName": "perftest020/01",
            "type": "43",
            "ws": "lpool"
        }],
        "time": 1505832486604
    },
    "msg": "操作成功",
    "resultCode": "00000"
};
