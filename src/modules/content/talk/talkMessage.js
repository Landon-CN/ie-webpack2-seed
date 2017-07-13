import moment from 'moment';
export default function (talk) {
    Object.assign(talk.prototype, {
        addMsg
    });

    const init = talk.prototype.init;
    talk.prototype.init = function () {
        init.call(this);

    }
}


// 添加消息
let lastTime;
const intervalTime = 5 * 60 * 1000; // 间隔5分钟以上才会显示时间条

const timeNow = moment();
// append false 代表是历史记录
function addMsg(data, append = true) {
    // console.log('添加消息==>', data);

    if (Array.isArray(data)) {
        data = {
            list: data
        }
    } else {
        data = {
            list: [data]
        }
    }


    const previousDayTime = [];
    for (let i = 0; i < data.list.length; i++) {
        let item = data.list[i];
        let time = moment(item.time || Date.now());

        // 历史记录，只展示最早的那个日期,按天算
        if (time < timeNow) {
            let day = time.format('YYYY-MM-DD');

            // 已经有时间展示记录，跳过
            if (previousDayTime.indexOf(day) > -1) {
                continue;
            }
            previousDayTime.push(day);
            data.list.splice(i, 0, {
                timeShow: true,
                message: time.format('YYYY-MM-DD HH:mm')
            });
            i++;
        }

        // 日期为当天
        else if (!lastTime || time - lastTime > intervalTime) {
            lastTime = time;
            data.list.splice(i, 0, {
                timeShow: true,
                message: lastTime.format('HH:mm')
            });
        }

    }


    const serviceListHtml = mustache.render(msgTpl, data);
    let dom = $(serviceListHtml);

    if (append) {
        msgBox.append(dom);
        scroll.scrollTop(msgBox.height());
    } else {
        historyDom.after(dom);
    }

    return dom;
}
