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
import * as service from './modules/content/talk/talkService';

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



function domInit() {
    header('.body-content');
    content('.body-content');
}

function init() {
    jquery.when(keyInit(), service.inlineInit()).then(() => {
        domInit();
    });
}



export default init;
