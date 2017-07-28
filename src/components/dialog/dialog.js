import tpl from './dialog.html';
import mustache from 'mustache';
import $ from 'jquery';
import './dialog.less';

const dialog = (function () {
    let dom;


    return {
        timer: null,

        open(message = '', timeout = 3000) {
            if (dom) {
                this.close();
            }
            dom = $(mustache.render(tpl, {
                message
            }));

            dom.on('click', '.close', () => {
                this.close();
            });
            let parent = $('body');
            $(parent).append(dom);
            if (timeout > 0) {
                setTimeout(() => this.close(), timeout);
            }
        },
        close() {
            dom && dom.remove();
            clearTimeout(this.timer);

            this.tiemr = null;
            dom = null;
        }
    };
})();

export {dialog};
