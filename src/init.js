import jquery from 'jquery';
import globalVar from 'globalVar';
import * as service from './modules/talk/talkService';
import {
    talk
} from './modules';

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
    });

}


function domInit() {
    talk.init()
}

function init() {
    jquery.when(keyInit(), service.inlineInit()).then(() => {
        // domInit();
    });
    domInit();
}




export default init;
