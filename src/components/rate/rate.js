import $ from 'jquery';
import globalVar from '../../globalVar';
import talk from '../../modules/talk/talk';
import moment from 'moment';

/**
 * 邀评交互
 */
(function rate(document) {
    const $document = $(document);
    $document.on('mouseenter', '.score > .score-item', (event) => {
        const $target = $(event.currentTarget);
        $target.addClass('active').nextAll().removeClass('active');
        $target.prevAll().addClass('active');
        const score = parseInt($target.data('score'), 10);
    });

    $document.on('mouseleave', '.score', (event) => {
        const $target = $(event.currentTarget);
        const chooseScore = $target.data('choose-source');
        $target.find('.score-item').each((index, item) => {
            const $item = $(item);
            const score = parseInt($item.data('score'), 10);
            if (score <= chooseScore) {
                $item.addClass('active');
            } else {
                $item.removeClass('active');
            }
        });
    });
    $document.on('click', '.score > .score-item', (event) => {
        const $target = $(event.currentTarget);
        const score = parseInt($target.data('score'), 10);
        $target.parent().data('choose-source', score);
        setRate(score);
    });

    // 小于4分，弹出不满意理由选择
    function setRate(score) {
        if (score < 4) {
            $('.dl-reason').show('normal');
        } else {
            $('.dl-reason').hide('normal');
        }
    }

    // 选择不满意原因
    $document.on('click', '.reason li', (event) => {

        $(event.currentTarget).toggleClass('active');
    });

    $document.on('click', '.rate-submit .btn', (event) => {
        if (globalVar.isRate) {
            return talk.addMsg({
                dialog: true,
                message: '请勿重复评价'
            });
        }



        const $target = $(event.currentTarget);
        const $reasonList = $target.parents('.rate').find('.reason li.active');
        const chooseScore = $target.parents('.rate').find('ul.score').data('choose-source');

        // 发生邀评-结束会话-再次进线-评价上一个客服，这时候不能把评价置灰
        if ($target.data('dialog-id') === globalVar.dialogId) {
            globalVar.isRate = true;
            disabled();
        }


        let reason = []; // 选择的原因
        $reasonList.each((idx, ele) => {
            reason.push($(ele).data('type'));
        });
        const params = {
            dialogId: $target.data('dialog-id'),
            toUser: $target.data('target-service-id'),
            sendTime: moment().format('YYYY-MM-DD HH:mm:ss.SSS'),
            score: chooseScore,
            reason: reason.join(','),
            userSay: ''
        };

        $.ajax({
            url: '/webpage/invitejudge/judge.htm',
            contentType: 'application/json; charset=utf-8',
            type: 'post',
            data: params
        }).then((result) => {
            if (result.data == '01') {
                talk.addMsg({
                    dialog: true,
                    message: '评价成功'
                });
            } else if (result.data == '02') {
                // 重复评价
                talk.addMsg({
                    dialog: true,
                    message: '请勿重复评价'
                });
            } else {
                talk.addMsg({
                    dialog: true,
                    message: '系统开小差啦~请稍后再试'
                });
            }
        });

    });

    /**
     * 禁用评价框
     */
    function disabled() {
        $(document).find('.message-row.appraise').addClass('disabled');
    }
})(document);
