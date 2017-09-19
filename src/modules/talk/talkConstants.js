// 提示消息文本
export const BOT_HEELO_MESSAGE = '亲爱的京东金融用户，金融小M智能机器人很高兴为您服务！';
export const ERROR_MESSAGE = '系统开小差啦,请稍后重试~';
export const RECONNECT_MESSAGE = '上次聊到这里';
export const INSERVICE_EMSSAGE = '京东金融客服很高兴为您服务';
export const ALREADY_RATE_MESSAGE = '您已经评价过了';
export const CLOSE_MESSAGE_TEXT = '本次会话已结束';
export const TRANSFER_MESSAGE_SUCCESS = '已为您转接到新的客服';
export const TEXT_CANCEL_QUEUE = '已取消排队';


export const OFFLINE_MSG_TIME = 25000; // 离线消息抓取间隔时间


// 消息类型
export const INSTANT_MESSAGE = 2; //即时消息
export const ROBOT_MESSAGE = 3; // 机器人消息
export const KEEP_MESSAGE = 10; // 心跳包
export const RECEIPT_MESSAGE = 11; // 时间信息
export const ROBOT_MESSAGE_V2 = 18; // 新机器人
export const INVITE_MESSAGE = 31; // 邀请评价
export const INLINE_MESSAGE = 32; // 进线成功消息
export const CLOSE_MESSAGE = 33; // 会话结束
export const DIALOG_TRANSFER_SUCCESS = 34; // 转接成功
export const DIALOG_TRANSFER_QUEUE = 35; // 转接排队



// 机器人接收消息类型
export const BOT_MESSAGE_TEXT = 'BOT_MESSAGE_TEXT';
export const BOT_MESSAGE_FLOD = 'BOT_MESSAGE_FLOD';
export const BOT_MESSAGE_SUGGESTION = 'BOT_MESSAGE_SUGGESTION';

// 发送消息类型
export const MSG_TYPE_BOT = 42;
export const MSG_TYPE_SERVICE = 2;

// 机器人回复类型
export const INTERACTION_TEXT = 'request_text';
export const INTERACTION_NORMAL_SELECT = 'request_normal_select';
export const INTERACTION_FEEDBACK_SELECT = 'request_feedback_select';


export const AJAX_SUCCESS_CODE = '00000';

// 历史记录返回消息类型
export const HISTORY_OLD_BOT_ASK = 40; // 发送旧版机器人
export const HISTORY_OLD_BOT_REPLY = 41; // 旧版机器人回执
export const HISTORY_NEW_BOT_ASK = 42; // 发送新版机器人
export const HISTORY_NEW_BOT_REPLY = 43; // 新版机器人回执
export const HISTORY_SERVICE = 2; // 和客服聊天
