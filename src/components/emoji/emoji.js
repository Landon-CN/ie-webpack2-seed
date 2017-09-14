import tpl from './emoji.html';
import mustache from 'mustache';
import $ from 'jquery';
import './emoji.less';
import {
    componentShow
} from 'utils';
import * as emojiImgs from './img';

// 这里编译出来会多一个属性
delete emojiImgs.__esModule;
let imgsKeys = Object.keys(emojiImgs);
export function emoji(parent, change = () => {}) {
    let dom;
    let showStatus = false;
    let classics = [];

    for (let i = 0; i < 72; i++) {
        let index = parseInt(i / 12);
        classics[index] = classics[index] || [];
        let num = i + 1;
        classics[index][i % 12] = {
            idx: i,
            src: emojiImgs[imgsKeys[i]],
            id: num >= 10 ? num : '0' + num
        };

    }


    const renderResult = mustache.render(tpl, {
        classics
    });

    dom = $(renderResult);

    dom.on('click', '.emoji-item', function (event) {
        let id = $(this).children('.emoji-border').data('id');
        const idx = $(this).children('.emoji-border').data('idx');
        change(emojiImgs[imgsKeys[idx]], id);
    });


    parent.append(dom);
    return {
        open: () => {
            showStatus = true;
            dom.show('fast');
        },
        close: () => {
            showStatus = false;
            dom.hide();
        },
        toggle() {
            if (!showStatus) {
                this.open();
            } else {
                this.close();
            }
        }
    }
}

/**
 * 根据id获取图片地址
 * @param {*} id
 */
export function getImgSrcById(id) {
    id = parseInt(id.substr(1)) - 1;
    return emojiImgs[imgsKeys[id]];
}
