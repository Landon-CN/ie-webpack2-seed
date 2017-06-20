const tpl = __inline('./dialog.html');
const mustache = window.Mustache;

window.components.dialog = (function () {
    let dom;
    

    return {
        id: '',
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
            let parent = $(document).find('.content  .talk-body');
            this.id = componentShow(parent, dom, this.id);

            if (timeout > 0) {
                setTimeout(() => this.close(), timeout);
            }
        },
        close() {
            dom && dom.remove();
            dom = null;
        }
    };
})();