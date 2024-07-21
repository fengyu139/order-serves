const path = require('path');
const log4js = require('log4js');
const layout = {
  type: 'pattern',
  pattern: '%d{yyyy-MM-dd hh:mm:ss.SSS} [%p] %m'
};

// 配置log4js
log4js.configure({
    appenders: {
        // 控制台输出
        console: { type: 'console' },
        // 日志文件
        file: { type: 'file', filename: path.join(__dirname, './logs/server.log'), layout ,pattern: '.yyyy-MM-dd'},
        errorFile: { type: 'file', filename: path.join(__dirname, './logs/server-error.log')},
    },
    categories: {
        // 默认日志
        default: { appenders: [ 'file', 'console' ], level: 'debug' },
    },
    
});
// 获取默认日志
const defaultLogger = log4js.getLogger();
// const errorLogger = log4js.getLogger('error');
// 日志代理，同时调用默认日志和错误日志
const loggerProxy = {};
const levels = log4js.levels.levels;
levels.forEach(level => {
    const curLevel = level.levelStr.toLowerCase();
    loggerProxy[curLevel] = (...params) => {
        defaultLogger[curLevel](...params);
        // errorLogger[curLevel](...params);
    }
});
module.exports = loggerProxy;