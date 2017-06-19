const tpl = __inline('./dialog.html');
const mustache = window.Mustache;

window.components.dialog = (function () {
    let dom;

    return {
        open(message = '', timeout = 5000) {
            if (dom) {
                this.close();
            }
            dom = $(mustache.render(tpl, {
                message
            }));

            dom.on('click', '.close', () => {
                this.close();
            });

            $(document.body).append(dom);

            if(timeout>0){
                setTimeout(()=>this.close(), timeout);
            }
        },
        close() {
            dom && dom.remove();
            dom = null;
        }
    };
})();