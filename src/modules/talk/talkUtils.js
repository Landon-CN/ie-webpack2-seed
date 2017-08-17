import globalVar from 'globalVar';
import {
    getImgSrcById
} from 'components/emoji/emoji';
import * as Constants from './talkConstants';

// 消息体解析
export function parseContent(xml) {

    if (xml.indexOf('<') != 0) {
        return xml;
    }
    let msgBody = $(xml);

    let htmlStr = '';
    msgBody.each((index, element) => {
        let nodeName = element.nodeName.toLowerCase();
        element = $(element);
        switch (nodeName) {
            case '#text':
                htmlStr += encode(element.text());
                break;
            case 'br':
                htmlStr += '<br/>';
                break;
            case 'e':
                let src = getImgSrcById(element.attr('s'));
                htmlStr += `<img src='${src}' />`;
                break;
            case 'img':
                htmlStr += `<img src='${element.attr('src')}' / class="open-img">`
                break;
            default:
                break;
        }
    });
    return htmlStr;
}

// 消息解析为xml
export function stringifyContent(html) {
    let htmlStr = '';

    if (globalVar.msgType === Constants.MSG_TYPE_BOT) {
        return $(`<body>${html}</body>`).text();
    }
    html = html.replace(/&nbsp;/g, ' ');
    $(`<body>${html}</body>`).each((index, element) => {
        let nodeName = element.nodeName.toLowerCase();
        element = $(element);
        switch (nodeName) {
            case 'br':
                htmlStr += '<br/>';
                break;
            case 'img':
                if (element.data('type'))
                    htmlStr += `<e t="d" s="${element.data('s')}" />`;
                else
                    htmlStr += `<img src='${element.attr('src')}' />`
                break;
            case '#text':
            default:

                htmlStr += encode(element.text());
                break;
        }
    });


    return `<body>${htmlStr}</body>`


}

export function encode(str) {
    str = str.replace(/</g, '&lt;');
    str = str.replace(/>/g, '&gt;');
    str = str.replace(/"/g, '&quot;');
    return str;
}

// 防抖动函数
// https://github.com/component/debounce
export function debounce(func, wait, immediate) {
    var timeout, args, context, timestamp, result;
    if (null == wait) wait = 100;

    function later() {
        var last = Date.now() - timestamp;

        if (last < wait && last >= 0) {
            timeout = setTimeout(later, wait - last);
        } else {
            timeout = null;
            if (!immediate) {
                result = func.apply(context, args);
                context = args = null;
            }
        }
    };

    var debounced = function () {
        context = this;
        args = arguments;
        timestamp = Date.now();
        var callNow = immediate && !timeout;
        if (!timeout) timeout = setTimeout(later, wait);
        if (callNow) {
            result = func.apply(context, args);
            context = args = null;
        }

        return result;
    };

    debounced.clear = function () {
        if (timeout) {
            clearTimeout(timeout);
            timeout = null;
        }
    };

    debounced.flush = function () {
        if (timeout) {
            result = func.apply(context, args);
            context = args = null;

            clearTimeout(timeout);
            timeout = null;
        }
    };

    return debounced;
};
