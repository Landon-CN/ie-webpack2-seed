/**
 * 排队
 */
import tpl from './line.html';
import mustache from 'mustache';
import $ from 'jquery';
import './line.less';

let dom;

function init() {
    dom = $(mustache.render(tpl,{}));

}
init();

export function open() {
    $('body').append(dom);
}

export function close(params) {

}
