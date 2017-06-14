/**
 * 组件显示方法,只支持jquery包裹一次的父节点缓存
 * 如果组件第一次显示则append到父节点
 * 如果组件不是第一次则$(xx).show()
 */
window.componentShow = (function () {
    const cache = {};
    return function (parent, dom) {
        let id = JSON.stringify(parent) + JSON.stringify(dom);
        if (!cache[id]) {
            cache[id] = true;
            $(parent).append(dom);
        }
        $(dom).show();
        console.log(cache);

    }
})();

$(function () {
    // 注册头部
    components.header('.body-content');
    // 注册内容
    components.content('.body-content');
});