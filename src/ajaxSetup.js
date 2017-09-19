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
            // return window.location.reload();
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

        console.error(xhr.setting, xhr, text, error);

        if (text === 'timeout') {
            // 网络问题
            addErrorMsg('网络开小差啦~请稍候重试');
        }

        // 轮训暂时报错不提示
        // 登录失效，刷新页面 xhr.readyState 0
        if (!!xhr.setting.errorIgnore === true || xhr.readyState === 0) {
            return;
        }

        if (process.env.NODE_ENV === 'development') {
            dialog.open('错误:' + error + '  path:' + xhr.setting.url);
        }


        // 连接异常，不报错
        // addErrorMsg();


    },
    beforeSend(xhr, setting) {
        xhr.setting = setting;
        if (setting.prefix !== false) {
            setting.url = '/jtalk' + setting.url;
        }


        if (setting.contentType && setting.contentType.indexOf('application/json') > -1) {
            let data = setting.data || {};
            setting.data = JSON.stringify(data);
        }

    }
});

function addErrorMsg(text = Constants.ERROR_MESSAGE) {
    // 先删除已有的error提示
    jquery('.error-dialog').remove();

    try {
        talk.addMsg({
            dialog: true,
            className: 'error-dialog',
            message: text
        });
    } catch (e) {}
}
window.addErrorMsg = addErrorMsg;
