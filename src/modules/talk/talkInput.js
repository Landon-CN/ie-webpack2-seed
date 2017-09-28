/**
 * 聊天框逻辑处理
 */
import * as Constants from './talkConstants';
import * as utils from './talkUtils';
import * as service from './talkService';
import globalVar from 'globalVar';
import moment from 'moment';
import recommondTpl from './tpl/recommond.html';
import mustache from 'mustache';
import $ from 'jquery';

const maxTextSize = 400;

export default function (talk) {
    Object.assign(talk.prototype, {
        inputKeyListener,
        submitListener,
        submit,
        inputResize,
        pasteListener,
        autoCompleteListener,
        recommondClickListener
    });

    const init = talk.prototype.init;
    talk.prototype.init = function (...args) {
        init.apply(this, args);
        this.inputKeyListener();
        this.submitListener();
        this.$inputBox = this.$dom.find('.input-box');
        this.pasteListener();
        this.autoCompleteListener();
        this.recommondClickListener();
    };
}

function submitListener() {
    this.$dom.on('click', '.btn-submit', () => {
        this.submit();
    });
}

function inputKeyListener() {
    // 处理输入框快捷键
    // TODO: 暂时保留两种快捷键
    this.$dom.on('keydown', '.input-box', (event) => {
        const keyCode = event.keyCode;
        let keyType = 'one';
        if (keyCode === 13) {
            event.preventDefault();
        }

        if (keyType === 'one' && keyCode === 13 && event.ctrlKey) {

            addBr();
            event.preventDefault();
        } else if (keyType === 'two' && keyCode === 13 && !event.ctrlKey) {
            addBr();
        }

        if (keyType === 'one' && keyCode === 13 && !event.ctrlKey) {
            this.submit();
            event.preventDefault();
        } else if (keyType === 'two' && keyCode === 13 && event.ctrlKey) {
            this.submit();
        }
    });

}


/**
 * 输入框不能超过400字
 * 废弃，中文输入法没法阻止
 */
// function inputMaxSizeListener() {
//     this.$dom.on('keydown', '.input-box', (event) => {

//         const keys = [8, 9, 16, 17, 18, 19, 20, 27, 33, 34, 35, 36, 37, 38, 39, 40, 45, 46, 144, 145];
//         if (keys.indexOf(event.keyCode) > -1 || event.ctrlKey || event.metaKey) {
//             // 功能按键
//             return;
//         }
//         let textLength = this.$inputBox.text().length;
//         if (textLength >= maxTextSize) {
//             event.preventDefault();
//         }
//     });
//     this.$dom.on('keyup', '.input-box', (event) => {
//         let text = this.$inputBox.text();
//         let textLength = text.length;
//         // if (textLength > maxTextSize) {
//         //     let cutLen = textLength - maxTextSize;
//         //     let html = this.$inputBox.html();
//         //     html = html.substr(0, html.length - cutLen);
//         //     this.$inputBox.html(html);
//         // }

//         this.$dom.find('.text-length-present').text(textLength);
//     });

//     this.$dom.on('blur', '.input-box', (event) => {
//         console.log(123);

//     })
// }



function submit() {


    let htmlText = this.$inputBox.html();
    if (htmlText == '' || htmlText == Constants.INPUT_PLACEHOLDER) {
        return;
    }

    if (this.$inputBox.text().length > maxTextSize) {
        // 超过最大字符限制
        this.$dom.find('.max-input-error').remove();
        return this.addMsg({
            dialog: true,
            className: 'max-input-error',
            message: `超过最大${maxTextSize}个字符,请重新输入`
        });
    }

    this.$inputBox.html('');
    this.$inputRecommond.hide();
    htmlText = $(`<div>${htmlText}</div>`);
    htmlText.find('.remove').remove();
    htmlText = htmlText.html();

    let content = utils.stringifyContent(htmlText);

    // 有消息才发送
    // 会话未关闭
    // 未排队
    if (content && !globalVar.isClose && globalVar.queueLength === 0) {
        service.sendMsg(globalVar.targetServiceId, {
            content
        }, {
            type: Constants.INTERACTION_TEXT
        });
    }

    this.addMsg({
        user: true,
        message: utils.parseContent(utils.strToXml(htmlText)),
        time: moment()
    });


    // 有排队的话，就发送排队消息
    if (globalVar.queueLength) {
        this.addLine(globalVar.queueLength);
    } else if (globalVar.isClose) {
        this.onlineClick = false;
        this.onlineServiceClick();
    }
}

// 添加换行
function addBr() {
    try {
        document.execCommand("insertHTML", false, "<br /><br />");
    } catch (e) {
        if (document.selection) {
            const range = document.selection.createRange();
            range.pasteHTML('<br /><br class=\'remove\' />');
        }
    }
}
/**
 * 动态调整输入框高度
 */
function inputResize() {

    const resize = () => {
        let height = $('.talk-editor').height();

        this.$inputBox.outerHeight(height - 70 - 10);
    };

    $(window).on('resize', resize);
    setTimeout(function () {
        resize();
    }, 0);
}


function pasteListener() {
    // 处理粘贴富文本
    this.$inputBox.on('paste', (e) => {
        e.preventDefault();
        let text;

        if (window.clipboardData && window.clipboardData.setData) {
            // IE
            text = window.clipboardData.getData('text');
        } else {
            text = (e.originalEvent || e).clipboardData.getData('text/plain');
        }

        // 判断是否超出最大长度
        let textLength = this.$inputBox.text().length;
        if (textLength + text.length > maxTextSize) {
            let cutLen = maxTextSize - textLength;
            text = text.substr(0, cutLen);
        }

        console.log('粘贴文本', text);

        if (text) {
            e.preventDefault();
            if (document.body.createTextRange) {
                let textRange;
                if (document.selection) {
                    textRange = document.selection.createRange();
                } else if (window.getSelection) {
                    let sel = window.getSelection();
                    var range = sel.getRangeAt(0);

                    // 创建临时元素，使得TextRange可以移动到正确的位置
                    var tempEl = document.createElement("span");
                    tempEl.innerHTML = "&#FEFF;";
                    range.deleteContents();
                    range.insertNode(tempEl);
                    textRange = document.body.createTextRange();
                    textRange.moveToElementText(tempEl);
                    tempEl.parentNode.removeChild(tempEl);
                }
                textRange.text = text;
                textRange.collapse(false);
                textRange.select();
            } else {
                // Chrome之类浏览器
                document.execCommand("insertText", false, text);
            }
        }
    });
}

/**
 * 机器人推荐话术
 */
function autoCompleteListener() {
    let lastText = '';
    this.$inputRecommond = this.$dom.find('.input-recommond');
    this.$dom.on('keydown', '.input-box', utils.debounce((event) => {

        const $target = $(event.currentTarget);
        const text = $.trim($target.text());

        if (text === lastText) {
            return;
        }
        lastText = text;

        if (text) {
            service.autoComplete(text).then((result) => {
                const data = result.data.data || [];
                // 拉消息期间，变成空，取消本次处理
                if (!$.trim($target.text())) return;

                const textReg = new RegExp(text, 'g');
                data.forEach(function (element) {
                    element.dom = element.question.replace(textReg, ($0) => {
                        return `<span class="light">${$0}</span>`;
                    });
                });
                const dom = mustache.render(recommondTpl, {
                    list: data
                });

                this.$inputRecommond.show().find('.recommond-list > ul').html(dom);
            });
        } else {
            this.$inputRecommond.hide();
        }


    }, 100));

    this.$dom.on('blur', '.input-box', () => {
        setTimeout(() => {
            this.$inputRecommond.hide();
        }, 150);
    });
}

/**
 * 监听推荐答案选中
 */
function recommondClickListener() {
    this.$dom.on('click', '.recommond-item', (event) => {
        event.preventDefault();
        event.stopPropagation();
        const text = $(event.currentTarget).text();
        this.$inputBox.text(text);
        this.$inputRecommond.hide();
    });
}
