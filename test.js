const fs = require('fs');
const axios = require('axios');

const logFilePath = 'test.log';
let zjCount = 0;
let dFlag = true;
// 在程序启动时清空日志文件
fs.writeFileSync(logFilePath, '', 'utf8');

function logMessage(message) {
  // 将日志信息追加到日志文件中
  fs.appendFileSync(logFilePath, message + '\n', 'utf8');
}

const http = axios.create({
  baseURL: 'https://dsn3377.com/web/rest',
  headers: {
    'Content-Type': 'application/json',
    'Cookie': 'affCode=77741; _locale_=zh_CN; ssid1=f05f31ef976c3b42cf607ddfe0891797; random=2235; token=6e28d7e4a0ac886d8db66fc8d5840e723533145e; 438fda7746e4=6e28d7e4a0ac886d8db66fc8d5840e723533145e; affid=seo7'
  }
});

var money = 2050;
var playNum = '';
var playMoney = 50;

// 计算大小比例并返回结果
function calculateSizeRatio(numbers) {
  let smallCount = 0; // 小于6的数量
  let largeCount = 0; // 大于5的数量

  numbers.forEach(num => {
    const numValue = parseInt(num);
    if (numValue <= 5) {
      smallCount++;
    } else if (numValue >= 6) {
      largeCount++;
    }
  });

  if (smallCount > largeCount) {
    return 'X'; // 小的多
  } else if (largeCount > smallCount) {
    return 'D'; // 大的多
  } else {
    return ''; // 大小相等
  }
}

async function getHistory() {
  let res = await http.get('/member/resulthistory?lottery=SGFT&date=2025-03-12');
  let openArr = res.data.result.map(item => item.result.split(',')[0]).reverse();

  for (let i = 0; i < openArr.length; i++) {
    if (i > 60) {
      let currentNum = openArr[i] > 5 ? 'D' : 'X';
      logMessage(`当前结果${currentNum}:${openArr[i]}`);
      if (playMoney == 800) {
        playMoney = 25;
      }
      if (playMoney > money) {
        logMessage('没钱了');
        logMessage(playMoney.toString());
        logMessage(money.toString());
        break;
      }
      if (currentNum == playNum) {
        logMessage('上期结果:中奖了');
        zjCount++;
        money += parseInt(playMoney * 1.999);
        playMoney = 50;
      } else if (playNum == '') {
        playMoney = 50;
      } else {
        logMessage('上期结果:未中奖');
        zjCount = 0;
        playMoney = playMoney * 2;
      }
      money -= playMoney;
      let sizeRatio = calculateSizeRatio(openArr.slice(i - 16, i - 1));
      if (zjCount > 5) {
        zjCount=0
      }
      logMessage(`本期下注：${sizeRatio}`);
      if (i === openArr.length - 1) {
        logMessage(openArr.slice(i - 16, i - 1).toString());
      }
      playNum = sizeRatio;
      logMessage(`--------------------------------${money}---${playMoney}`);
    }
  }
  logMessage(money.toString());
}

getHistory();