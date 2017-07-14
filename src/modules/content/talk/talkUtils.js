import globalVar from 'globalVar';
import {
    getImgSrcById
} from 'components/emoji/emoji';
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
                htmlStr += element.text();
                break;
            case 'br':
                htmlStr += '<br/>';
                break;
            case 'e':
                let src = getImgSrcById(element.attr('s'));
                htmlStr += `<img src='${src}' />`;
                break;
            case 'img':
                htmlStr += `<a href="${element.attr('src')}" target="_blank"><img src='${element.attr('src')}' /></a>`
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

    if (globalVar.targetServiceId === globalVar.botId) {
        return $(`<body>${html}</body>`).text();
    }

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
    str = str.replace(/&/g, '&amp;');
    str = str.replace(/</g, '&lt;');
    str = str.replace(/>/g, '&gt;');
    str = str.replace(/"/g, '&quot;');
    return str;
}
