import jquery from 'jquery';
import {
    dialog
} from './components';

jquery.ajaxSetup({
    timeout: 10000,
    cache: false,
    dataType: 'json',
    processData: false,
    success(result, status, xhr) {

        if (result.resultCode !== '00000' && xhr.setting.url.indexOf('/message/conn?type=conn&time=') === -1) {
            dialog.open('错误:' + JSON.stringify(result) + '  path:' + xhr.setting.url);
            throw new Error(result.msg);
        }
    },
    error(xhr, text, error) {

        // 轮训暂时报错不提示
        if (xhr.readyState !== 0 && xhr.setting.url.indexOf('/message/conn?type=conn&time=') == -1) {
            console.error(xhr.setting, xhr, text, error);
            dialog.open('错误:' + error + '  path:' + xhr.setting.url);
        }

    },
    beforeSend(xhr, setting) {
        xhr.setting = setting;
        setting.url = '/jtalk' + setting.url;

        setting.contentType = setting.contentType === false ? setting.contentType : 'application/json; charset=utf-8';

        if (setting.contentType && setting.contentType.indexOf('json') > -1) {
            let data = setting.data || {};
            setting.data = JSON.stringify(data);
        }



        xhr.setRequestHeader('web_personal_key', window.webPersonalKey);

    }
});
