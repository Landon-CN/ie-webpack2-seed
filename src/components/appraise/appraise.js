const NAME = 'appraise';
const tpl = __inline('./appraise.html');
const mustache = window.Mustache;

const rateText = ['非常不满意', '不满意', '一般', '满意', '非常满意'];
const reasonList = [{
        id: 1,
        text: '回复不及时'
    },
    {
        id: 2,
        text: '态度差'
    },
    {
        id: 3,
        text: '问题没得到解决'
    }
];


window.components[NAME] = function (parent) {
    let dom, rateSocre = -1,
        reason = [];
    dom = $(mustache.render(tpl, {
        reasonList
    }));
    let rate = window.components.rate(dom.find('.rate-content'),rateChange);

    dom.on('click', '.reason-item', function (event) {
        event.stopPropagation();
        let item = $(this);
        item.toggleClass('active');
        let id = item.data('id');
        recordReson(id);
    });

    dom.on('click', '.submit', function (event) {
        event.stopPropagation();
        event.preventDefault();

        // 用户未进行任何操作
        if (rateSocre === -1) {
            return false;
        }
        let reasonText = dom.find('.reason-text').val();
        // TODO: ajax交互

    });

    dom.on('click', '.close', function (event) {
        event.stopPropagation();
        event.preventDefault();
        dom.hide();
    });

    //记录不满意原因
    function recordReson(id) {
        for (let i = 0; i < reason.length; i++) {
            if (reason[i] === id) {
                return reason.splice(i, 1);
            }
        }
        reason.push(id);
    }

    // 评分变化
    function rateChange(rate) {
        rateSocre = rate;
        dom.find('.user-attitude').text(rateText[rate - 1]);
        if (rate < 4) {
            $('.reason-box').show();
        } else {
            $('.reason-box').hide();
        }
    }

    return {
        open: function () {
            componentShow(parent,dom);
        },
        close: function () {
            dom.hide();
        }
    }
}