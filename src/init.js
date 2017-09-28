import jquery from 'jquery';
import globalVar from 'globalVar';
import * as service from './modules/talk/talkService';
import {
    talk
} from './modules';
window.globalVar = globalVar;

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
        globalVar.userName = result.data.jdPin;

    });

}


function domInit() {
    talk.init();
}

function init() {
    let args = getUrlParams();

    globalVar.initSource = args.initSource || args.source || '03';
    globalVar.companyId = args.companyId || 1;
    globalVar.entrance = args.entrance || undefined;


    jquery.when(keyInit(), service.inlineInit()).then(() => {
        domInit();
    });
}


if (process.env.NODE_ENV === 'development') {
    window.globalVar = globalVar;
}


/**
 * 获取url参数
 */
function getUrlParams() {
    let queryString = window.location.search.substr(1);

    let argsArr = queryString.split('&');
    if (argsArr[0] === '') {
        argsArr.shift();
    }
    let argsObj = {};
    for (let i = 0; i < argsArr.length; i++) {
        let args = argsArr[i].split('=');
        argsObj[args[0]] = args[1];
    }
    return argsObj;
}




export default init;
