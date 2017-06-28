import tpl from './emoji.html';
import mustache from 'mustache';
import $ from 'jquery';
import './emoji.less';
import {
  componentShow
} from 'utils';

let tip;

function setTip(show, pos, img) {

  let opacity = show ? 1 : 0;

  if (!show) {
    tip.css({
      opacity
    });
    return;
  }

  let left = pos.left + 29;
  let top = pos.top + 29;
  // TODO: 对opacity加入防抖动
  tip.css({
    opacity,
    left,
    top
  }).find('img').attr('src', img)
}
let dom;
export function emoji(parent, change = () => {}) {

  let showStatus = false;
  let classics = [];
  for (let i = 0; i < 72; i++) {
    let index = parseInt(i / 12);
    classics[index] = classics[index] || [];
    let num = i + 1;
    classics[index][i % 12] = num >= 10 ? num : '0' + num;

  }


  const renderResult = mustache.render(tpl, {
    classics
  });

  dom = $(renderResult);
  dom.on('mouseenter', '.emoji-border', function (event) {
    let pos = $(this).position();
    let id = $(this).data('id');
    let img = $(this).children('.emoji').css('backgroundImage');


    img = extractBase64(img);

    setTip(true, pos, img);
  });

  dom.on('mouseleave', '.emoji-border', function (event) {
    setTip(false);
  });

  dom.on('click', '.emoji-item', function (event) {
    let id = $(this).children('.emoji-border').data('id');
    let src = $(this).find('.emoji').css('backgroundImage');
    change(extractBase64(src), id);
  });



  tip = dom.find('.emoji-show-body');


  parent.append(dom);
  return {
    open: () => {
      showStatus = true;
      dom.show();
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
 * 提取url("xxxxx")
 * @param {string} src
 */
function extractBase64(src) {

  let result = src.match(/url\("([\s\S]+)?"\)|url\(([\s\S]+)?\)/);
  return result[1] || result[2];

}


/**
 * 根据ID获取src路径
 * @param {str} id
 */
export function getImgSrcById(id) {
  let num = id.match(/s(\d+)/)[1];
  let className = '.emoji-classics-' + num;

  return extractBase64(dom.find(className).css('backgroundImage'));
}
