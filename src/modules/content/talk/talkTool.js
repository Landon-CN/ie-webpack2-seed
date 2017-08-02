import {
    emoji as Emoji
} from 'components/emoji/emoji';
import Appraise from './appraise/appraise';
import * as Constants from './talkConstants';
import globalVar from 'globalVar';
export default function (talk) {
    Object.assign(talk.prototype, {
        toolItemListener,
        imgUploadListener,
        closeListener,
        emojiChange,
        closeOther,
        addEmoji,
        rateListener
    });

    const init = talk.prototype.init;
    talk.prototype.init = function (...args) {
        init.apply(this, args);
        this.emoji = Emoji(this.dom.find('.toolbar'), emojiChange.bind(this));
        this.appraise = Appraise(this.dom.find('.toolbar'), true);
        this.rateTooltip = this.dom.find('.rate-tooltip');
        this.toolItemListener();
        this.closeListener();
        this.rateListener();
    }
}

function toolItemListener() {
    this.dom.on('click', '.tool-item', (event) => {
        event.stopPropagation();
        const type = $(event.currentTarget).data('type');
        this.closeOther(type);
        this.rateTooltip.hide();
        switch (type) {
            case 'emoji':
                this.emoji.toggle();
                break;
            case 'rate':
                this.appraise.toggle();
                break;
            default:
                break;
        }
    });

    // 邀请评价
    this.dom.on('click', '.open-rate', (event) => {

        event.stopPropagation();
        addAppraise();
    });

}

function imgUploadListener() {
    const imgReg = /(\.|\/)(gif|jpe?g|png)$/i;
    this.dom.find('.fileinput-button').fileupload({
        pasteZone: this.inputBox,
        dropZone: $(document),
        maxFileSize: '5000000',
        dataType: 'json',
        url: '/webpage/file/upload.htm',
        acceptFileTypes: imgReg,
        done: (e, result) => {

            let data = result.result.data[0];
            let url = data.url;
            let msg = `<img src='${url}' class="open-img">`;

            this.inputBoxPlaceholderJudge();
            this.inputBox.append(msg);

        }
    });
}

function closeListener() {
    $(document).on('click', () => {
        this.dom.find('.submit-type').hide();
        this.closeOther();
    });

}

// 表情包选中
function emojiChange(src, id) {
    const img = document.createElement('img');

    $(img).attr({
        src,
        'data-type': 'e',
        'data-s': 's' + id
    });
    this.addEmoji(img);
}

// 关闭其他弹窗
function closeOther(type) {
    if (type !== 'emoji') {
        this.emoji.close();
    }

    if (type !== 'rate') {
        this.appraise.close();
    }

}



/**
 * 添加表情
 * @param {*} emoji
 */
function addEmoji(emoji) {
    let inputBox = this.inputBox;
    this.inputBoxPlaceholderJudge(inputBox)
    inputBox.append(emoji);
}


function rateListener() {
    let dom = this.dom;
    let rateTooltip = this.rateTooltip;
    dom.on('mouseenter', '.rate-tool', () => {
        if (globalVar.isRate) {
            rateTooltip.find('.text').text(Constants.ALREADY_RATE_MESSAGE);
            rateTooltip.show();
        }
    });

    dom.on('mouseleave', '.rate-tool', () => {
        if (globalVar.isRate) {
            rateTooltip.hide();
        }
    });

    dom.on('click', '.rate-tooltip .close', () => {
        dom.find('.rate-tooltip').hide();
    });

}
