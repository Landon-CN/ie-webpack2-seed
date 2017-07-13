/**
 * 聊天框逻辑处理
 */
import * as Constants from './talkConstants';
import * as utils from './talkUtils';
import * as service from './talkService';
import globalVar from 'globalVar';

function submitListener() {
    this.dom.on('click', '.btn-submit', (event) => {
        this.submit();
    });
}

function inputKeyListener() {
    // 处理输入框快捷键
    // TODO: 暂时保留两种快捷键
    this.dom.on('keydown', '.input-box', (event) => {
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
    let htmlText = this.inputBox.html();
    if (htmlText == '' || htmlText == Constants.INPUT_PLACEHOLDER) {
        return;
    }

    this.inputBox.html('');
    htmlText = $(`<div>${htmlText}</div>`);
    htmlText.find('.remove').remove()
    htmlText = htmlText.html();

    let content = utils.stringifyContent(htmlText);

    // 有消息才发送
    if (content && !globalVar.isClose) {
        service.sendMsg(globalVar.targetServiceId, {
            content
        });
    }

    if (globalVar.isClose) {
        onlineClick = false;
        onlineServiceClick();
    }

    addMsg({
        user: true,
        message: htmlText
    });
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

export default function (talk) {
    Object.assign(talk.prototype, {
        inputKeyListener,
        submitListener,
        submit,
    });

    const init = talk.prototype.init;
    talk.prototype.init = function () {
        init.call(this);
        this.inputKeyListener();
        this.submitListener();
        this.inputBox = this.dom.find('.input-box');
    }
}
