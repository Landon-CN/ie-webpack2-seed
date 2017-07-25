import uuidv1 from 'uuid/v1';

export default {
    uuid: uuidv1(), // 一个页面的唯一key
    jdPin: null, // 用户jdpin
    webPersonalKey: null, // 校验key
    userId: null, // 用户ID
    dialogId: null, // 会话ID
    isRate: false, // 是否评价过
    targetServiceId: null, // 对话方ID
    botId: 10001, // 机器人ID
    groupId: null, //分组ID,进线后使用
    isClose: false, //是否被断开连接
    msgType: 3, //消息类型,3 机器人，2 客服
    welcomeWords: '欢迎回到京东金融客服', //欢迎语
}
