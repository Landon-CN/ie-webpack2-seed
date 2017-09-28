import $ from 'jquery';

/**
 * 头部控制
 */
function header() {
    // 控制.talk-header 下的所有节点
    this.$dom = $('.talk-header');
    // this.closeListener();

}

/**
 * 人工客服模式
 * 切换头部为人工客服
 */
header.prototype.headerInservice = function () {
    const $title = this.$dom.find('.title');
    $title.removeClass('bot-title').addClass('user-title').text('人工客服');
};

/**
 * 关闭按钮
 */
header.prototype.closeListener = function () {
    this.$dom.on('click', '.close', () => {
        window.location.href = "about:blank";
    });
};


export default new header();
