import jquery from 'jquery';

import {
    dialog
} from './components';
import talk from './modules/talk/talk';
import * as Constants from './modules/talk/talkConstants';

jquery.ajaxSetup({
    timeout: 10000,
    cache: false,
    dataType: 'json',
    processData: false,
    success(result, status, xhr) {

        if (result.error === 'NotLogin') {
            // 登录超时，刷新页面
            return window.location.reload();
        }

        if (result.resultCode !== '00000' && !!xhr.setting.errorIgnore === false) {
            if (process.env.NODE_ENV === 'development') {
                dialog.open('错误:' + JSON.stringify(result) + '  path:' + xhr.setting.url);
            }
            addErrorMsg();
        }
        return result;
    },
    error(xhr, text, error) {

        // 轮训暂时报错不提示
        // 网络问题不提示
        if (!!xhr.setting.errorIgnore === false || text === 'timeout') {
            console.error(xhr.setting, xhr, text, error, process.env.NODE_ENV);

            if (process.env.NODE_ENV === 'development') {
                dialog.open('错误:' + error + '  path:' + xhr.setting.url);
            }
            addErrorMsg();
        }

    },
    beforeSend(xhr, setting) {
        xhr.setting = setting;
        setting.url = '/jtalk' + setting.url;

        if (setting.contentType && setting.contentType.indexOf('application/json') > -1) {
            let data = setting.data || {};
            setting.data = JSON.stringify(data);
        }

    }
});

function addErrorMsg() {
    try {
        talk.addMsg({
            dialog: true,
            message: Constants.ERROR_MESSAGE
        });
    } catch (e) {}
}
