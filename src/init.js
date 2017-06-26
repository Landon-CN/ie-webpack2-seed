import jquery from 'jquery';
import {content,header} from './modules';

function init() {
    jquery.ajax({
        url: '/message/login/key.htm',
        type: 'post',
        contentType: 'application/json; charset=utf-8'
    }).then((result) => {
        window.jdPin = result.data.jdPin;
        window.webPersonalKey = result.data.webPersonalKey;
        window.userId = result.data.userId;
    }).then(() => {
        // domInit();
    });
}

function domInit() {
    header('.body-content');
    content('.body-content');
}
domInit();
export default init;