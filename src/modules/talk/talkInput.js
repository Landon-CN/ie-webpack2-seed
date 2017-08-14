/**
 * 聊天框逻辑处理
 */
import * as Constants from './talkConstants';
import * as utils from './talkUtils';
import * as service from './talkService';
import globalVar from 'globalVar';


export default function (talk) {
    Object.assign(talk.prototype, {
        inputKeyListener,
        submitListener,
        submit,
        inputBoxPlaceholderJudge,
        inputBoxPlaceholder,
        inputResize,
        pasteListener,
        autoCompleteListener
    });

    const init = talk.prototype.init;
    talk.prototype.init = function (...args) {
        init.apply(this, args);
        this.inputKeyListener();
        this.submitListener();
        this.$inputBox = this.$dom.find('.input-box');
        this.inputBoxPlaceholder();
        // this.inputResize();
        this.pasteListener();
        // this.autoCompleteListener();
    }
}

function submitListener() {
    this.$dom.on('click', '.btn-submit', (event) => {
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


function submit() {
    let htmlText = this.$inputBox.html();
    if (htmlText == '' || htmlText == Constants.INPUT_PLACEHOLDER) {
        return;
    }

    this.$inputBox.html('');
    htmlText = $(`<div>${htmlText}</div>`);
    htmlText.find('.remove').remove()
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
        message: htmlText
    });
    console.log('发送时长度',globalVar.queueLength);

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
        document.execCommand("insertHTML", false, "<br /><br />")
    } catch (e) {
        if (document.selection) {
            const range = document.selection.createRange();
            range.pasteHTML('<br /><br class=\'remove\' />')
        }
    }
}

const placeholderClassName = Constants.INPUT_PLACEHOLDER_CALSS;
const defaultText = Constants.INPUT_PLACEHOLDER;
// 判断是否placeholder需要删除
function inputBoxPlaceholderJudge() {
    let $inputBox = this.$inputBox;
    if ($inputBox.html() == defaultText) {
        $inputBox.removeClass(placeholderClassName);
        $inputBox.text('');
    }
}

/**
 * 输入框的placehloder
 * @param {*} dom
 */
function inputBoxPlaceholder() {
    let dom = this.$dom;
    let $inputBox = this.$inputBox;
    $inputBox.addClass(placeholderClassName);
    $inputBox.text(defaultText);
    $inputBox.on('focus', () => {

        this.inputBoxPlaceholderJudge($inputBox);
        dom.find('.rate-tooltip').hide();
    });
    $inputBox.on('blur', () => {
        if ($inputBox.html() == '') {
            $inputBox.addClass(placeholderClassName);
            $inputBox.text(defaultText);
        }
    });
}


/**
 * 动态调整输入框高度
 */
function inputResize() {

    const resize = () => {
        let height = $('.talk-editor').height();

        this.$inputBox.outerHeight(height - 70 - 10);
    }

    $(window).on('resize', resize);
    setTimeout(function () {
        resize();
    }, 0);
}


function pasteListener() {
    // 处理粘贴富文本
    this.$inputBox.on('paste', (e) => {

        let text;

        if (window.clipboardData && clipboardData.setData) {
            // IE
            text = window.clipboardData.getData('text');
        } else {
            text = (e.originalEvent || e).clipboardData.getData('text/plain');
        }
        if (text) {
            e.preventDefault();
            if (document.body.createTextRange) {
                if (document.selection) {
                    textRange = document.selection.createRange();
                } else if (window.getSelection) {
                    sel = window.getSelection();
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

function autoCompleteListener() {
    this.dom.on('keydown', '.input-box', (event) => {
        console.log(111);
        const $target = $(event.currentTarget);
        console.log($target.text());



        // service.autoComplete().then((result)=>{
        //     console.log(result);
        // });

    });
}
