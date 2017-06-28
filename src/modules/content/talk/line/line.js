/**
 * 排队
 */
import tpl from './line.html';
import mustache from 'mustache';
import $ from 'jquery';
import './line.less';
import {modal} from 'components';


let lineModal;

function init() {
    let dom = $(mustache.render(tpl,{}));
    dom.on('click','.btn-continu',(event)=>{

    });

    lineModal = modal(dom);
}
init();

export function open() {
    lineModal.open();
}

export function close() {
    lineModal.close();
}
