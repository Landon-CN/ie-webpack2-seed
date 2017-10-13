/**
 * 代理设置
 */

let targetUrl = ''; // server
let messageUrl = ''; // server
let bmsUrl = '';
let webImPort = '';
let messagePort = '';
let bmsPort = '';

let local = true;
if (local) {
    targetUrl = '10.9.10.31';
    messageUrl = '10.9.10.31';
    bmsUrl = '10.9.10.31';
    bmsPort = '8160';
    messagePort = '8090';
    webImPort = '8088';
}


// 开发环境
// http://wiki.cbpmgt.com/confluence/pages/viewpage.action?pageId=20595574
let dev = true;
if (dev) {
    targetUrl = '172.25.47.40';
    messageUrl = '172.25.47.40';
    bmsUrl = '172.25.47.40';
    bmsPort = '8160';
    messagePort = '8090';
    webImPort = '8088';
}

let test = true;
if (test) {
    targetUrl = 'jtalk.jd.com';
    messageUrl = 'jtalk.jd.com';
    bmsUrl = 'jtalk.jd.com';
    bmsPort = '80';
    webImPort = '80';
    messagePort = '80'
}


module.exports = {
    '/jtbms/**': {
        target: `http://${bmsUrl}:${bmsPort}`,
        changeOrigin: true,
    },
    '/jtalk/message/**': {
        target: `http://${messageUrl}:${messagePort}`,
        changeOrigin: true,
    },
    '/jtalk/**': {
        target: `http://${targetUrl}:${webImPort}`,
        changeOrigin: true,
    }
}