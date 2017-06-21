const NAME = 'appraise';
const tpl = __inline('./appraise.html');
const mustache = window.Mustache;

const rateText = ['非常不满意', '不满意', '一般', '满意', '非常满意'];
const reasonList = [{
        id: 'JA',
        text: '回复不及时'
    },
    {
        id: 'JB',
        text: '态度差'
    },
    {
        id: 'JC',
        text: '问题没得到解决'
    }
];


window.components[NAME] = function (parent,top=false) {
    let dom, rateSocre = -1,
        reason = [];
    dom = $(mustache.render(tpl, {
        reasonList
    }));

    if(top){
        dom.addClass('top')
    }

    let rate = window.components.rate(dom.find('.rate-content'), rateChange);

    dom.on('click', function (event) {
        event.stopPropagation();
    })

    dom.on('click', '.reason-item', function (event) {
        event.stopPropagation();
        let item = $(this);
        item.toggleClass('active');
        let id = item.data('id');
        recordReson(id);
    });

    let isRate = false;
    dom.on('click', '.submit', function (event) {
        event.stopPropagation();
        event.preventDefault();

        // 用户未进行任何操作
        if (rateSocre === -1) {
            return false;
        }

        // 防止重复提交
        if(isRate){
            return;
        }
        isRate=true;
        top && dom.hide();
        let reasonText = dom.find('.reason-text').val();

        const data = {
            toUser: window.targetServiceId,
            sendTime: moment().format('YYYY-MM-DD HH:mm:SS'),
            score:rateSocre,
            reason: reason.join(','),
            userSay: reasonText,
            dialogId: window.dialogId
        }
        sendRate(data);
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
            dom.find('.reason-box').show();
        } else {
            dom.find('.reason-box').hide();
        }
    }
    let showStatus = false;
    let id = '';
    return {
        open: function () {
            if(isRate){
                return;
            }

            showStatus = true;
            id = componentShow(parent, dom, id);
        },
        close: function () {
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

// 发送评价
function sendRate(params) {
    return $.ajax({
        url:'/webpage/invitejudge/judge.htm',
        contentType: 'application/json; charset=utf-8',
        type:'post',
        data:params,
        headers:{
            web_personal_key:window.webPersonalKey
        }
    }).then((result)=>{
        if(result.data  == '01'){
            components.dialog.open('评价成功')
        }else if(result.data == '02'){
            // 重复评价
            components.dialog.open('请勿重复评价')
        }else{
            components.dialog.open('评价异常')
        }
    });
}