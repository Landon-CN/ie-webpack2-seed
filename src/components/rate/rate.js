import tpl from './rate.html';
import mustache from 'mustache';
import $ from 'jquery';
import './rate.less';


/**
 * @param  {number} max=5 评分数量
 * @param  {function} change 评分变化
 * @param  {number} currentRate 初始评分
 */
export default function (parent,change = () => {},max = 5 , currentRate = 0) {
    let maxRate = [];
    for (let i = 1; i <= max; i++) {
        maxRate[i - 1] = i;
    }

    const tplResult = mustache.render(tpl, {
        maxRate
    });

    const dom = $(tplResult);
    let itemList = dom.children('.rate-item');

    dom.on('mouseenter', '.rate-item', function (event) {
        const rate = $(this).data('rate');
        setRate(parseInt(rate, 10));
    });

    dom.on('click', '.rate-item', function (event) {
        event.stopPropagation();
        const rate = parseInt($(this).data('rate'),10);
        if(rate !== currentRate){
            currentRate = rate;
            setRate(rate);
            change(rate);
        }
    });

    dom.on('mouseleave', function () {
        setRate(currentRate);
    });

    function setRate(rate) {
        if (rate < 1) {
            return itemList.removeClass('active');
        } else if (rate > max) {
            return itemList.addClass('active');
        }

        itemList.each(function (index, element) {

            if (index < rate) {
                $(element).addClass('active')
            } else {
                $(element).removeClass('active');
            }
        });
    }

    // 初始化分数
    setRate(currentRate);

    $(parent).append(dom);
}
