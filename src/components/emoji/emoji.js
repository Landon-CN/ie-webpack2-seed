const NAME = 'emoji';
const tpl = __inline('./emoji.html');
const mustache = window.Mustache;

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

window.components[NAME] = function (parent, change = () => {}) {
    let dom;
    let showStatus = false;
    let classics = [];
    for (let i = 0; i < 72; i++) {
        let index = parseInt(i / 12);
        classics[index] = classics[index] || [];
        classics[index][i % 12] = i + 1;
    }
    const renderResult = mustache.render(tpl, {
        classics
    });

    dom = $(renderResult);
    dom.on('mouseenter', '.emoji-border', function (event) {
        let pos = $(this).position();
        let id = $(this).data('id');
        let img = genrateImgSrc(id);

        setTip(true, pos, img);
    });

    dom.on('mouseleave', '.emoji-border', function (event) {
        setTip(false);
    });

    dom.on('click', '.emoji-item', function (event) {
        let id = $(this).children('.emoji-border').data('id');
        change(genrateImgSrc(id),id);
    });

    tip = dom.find('.emoji-show-body');
    let id = '';

    function genrateImgSrc(id) {
        return `imgs/s${id<10?`0${id}`:id}.gif`;
    }

    return {
        open: () => {
            showStatus = true;
            id = componentShow(parent, dom, id);
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