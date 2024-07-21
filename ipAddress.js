const os = require('os');
// 获取网络接口列表
const networkInterfaces = os.networkInterfaces();
// 找到第一个非内部地址的 IPv4 地址
const ipAddress = Object.values(networkInterfaces)
  .flat()
  .filter((iface) => iface.family === 'IPv4' && !iface.internal)
  .map((iface) => iface.address)[0];
// console.log('Server IP Address:', ipAddress);
module.exports = ipAddress