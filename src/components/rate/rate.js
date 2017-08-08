import $ from 'jquery';

/**
 * 邀评交互
 */
(function rate(document) {
    const $document = $(document);
    let chooseScore = 0;
    $document.on('mouseenter', '.score > .score-item', (event) => {
        const $target = $(event.currentTarget);
        $target.addClass('active').nextAll().removeClass('active');
        $target.prevAll().addClass('active');
        const score = parseInt($target.data('score'), 10);
    });

    $document.on('mouseleave', '.score', (event) => {
        const $target = $(event.currentTarget);
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
        setRate(score)
    });

    // 小于4分，弹出不满意理由选择
    function setRate(score) {
        chooseScore = score;
        if (score < 4) {
            $('.dl-reason').show('normal');
        }else{
            $('.dl-reason').hide('normal');
        }
    }
})(document);
