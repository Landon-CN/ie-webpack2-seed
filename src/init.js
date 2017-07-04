import jquery from 'jquery';
import {content,header} from './modules';
import globalVar from 'globalVar';


function init() {
    jquery.ajax({
        url: '/message/login/key.htm',
        type: 'post',
        contentType: 'application/json; charset=utf-8'
    }).then((result) => {
        globalVar.jdPin = result.data.jdPin;
        globalVar.webPersonalKey = result.data.webPersonalKey;
        globalVar.userId = result.data.userId;
    }).then(() => {
        domInit();
    });
}

function domInit() {
    header('.body-content');
    content('.body-content');
}

export default init;
