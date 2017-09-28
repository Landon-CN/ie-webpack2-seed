import globalVar from 'globalVar';
import {
    getImgSrcById
} from 'components/emoji/emoji';
import * as Constants from './talkConstants';
// 提出来了，因为getter setter会影响ie8，并且功能也没用到，手动注释
import xmlParse2 from '../../lib/htmlparse2';
import $ from 'jquery';


export function parseContent(xml) {
    let htmlStr = '';
    xml = xml.replace(/&amp;/g, '&');
    let tag;
    const parse = new xmlParse2.Parser({
        onopentag(tagName, attrs) {
            tag = tagName;
            let href;
            switch (tag) {
                case 'img':
                    htmlStr += `<img src='${attrs.src}' class="open-img" />`;
                    break;
                case 'e':
                    htmlStr += `<img src='${getImgSrcById(attrs.s)}' class="emoji" />`;
                    break;
                case 'br':
                    htmlStr += '<br />';
                    break;
                case 'a':
                    href = attrs.href;
                    if (!/^http/.test(href)) {
                        href = 'http://' + href;
                    }
                    htmlStr += `<a href="${href}" target="_blank" class="open-link" >`;
                    break;
                case 'body':
                    break;
                default:
                    throw new Error('不能识别的类型:' + tagName);

            }

        },
        ontext(text) {
            switch (tag) {
                case 'a':
                    htmlStr += text;
                    break;

                default:
                    htmlStr += noScript(text);
                    break;
            }
        },
        onclosetag() {
            switch (tag) {
                case 'a':
                    htmlStr += '</a>';
                    break;
                default:
            }
        }
    });
    parse.write(`<body>${xml}</body>`);
    parse.end();


    return htmlStr;
}

/**
 * 防注入
 * @param {*} test
 */
function noScript(test) {
    test = test.replace(/</g, '&lt;');
    test = test.replace(/>/g, '&gt;');
    return test;
}


// 消息解析为xml
export function stringifyContent(html) {


    if (globalVar.msgType === Constants.MSG_TYPE_BOT) {
        return $(`<body>${html}</body>`).text();
    }

    return strToXml(html);
}

/**
 * 将消息解析为xml
 * @param {*} html
 */
export function strToXml(html) {
    let htmlStr = '';
    html = html.replace(/&nbsp;/g, ' ');
    const parse = new xmlParse2.Parser({
        onopentag(tagName, attrs) {

            if (tagName === 'img') {
                if (attrs['data-type'] === 'e') {
                    htmlStr += `<e t="d" s="${attrs['data-s']}" />`;
                } else {
                    htmlStr += `<img src='${attrs.src}'  />`;
                }
            }
        },
        ontext(text) {
            text = encode(text);
            htmlStr += extractUrl(text);
        }
    });
    parse.write(`<body>${html}</body>`);
    parse.end();
    return `<body>${htmlStr}</body>`.replace(/&/g, '&amp;');
}


/**
 * 替换url为a标签
 * @param {*} text
 */
export function extractUrl(text) {
    return text.replace(/(http:\/\/|https:\/\/|www\.)[a-z0-9/]+[a-z0-9./?&%=_#-:]*\.[a-z0-9/?&%=_#-:]+/gi, (s1) => {
        let href = s1;
        if (!/^http/.test(href)) {
            href = 'http://' + href;
        }
        return `<a class="open-link" target="_blank" href="${href}">${s1}</a>`;
    });
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
    }

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
}
