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
    'Cookie': 'affCode=77741; _locale_=zh_CN; affid=seo7; ssid1=85b381a69062250cb329e0634931754d; random=7515; token=b93bfb6c605a9dade374bcb4c5be030a8e2d9a0f; 438fda7746e4=b93bfb6c605a9dade374bcb4c5be030a8e2d9a0f'
  }
});

var money = 3000;
var playNum = '';
var  playMoney = 50;

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
  let res = await http.get('/member/resulthistory?lottery=SGFT&date=2025-04-06');
  let openArr = res.data.result.map(item => item.result.split(',')[0]).reverse();

  for (let i = 0; i < openArr.length; i++) {
    if (i > 17) {
      let currentNum = openArr[i] > 5 ? 'D' : 'X';
      logMessage(`当前结果${currentNum}:${openArr[i]}`);
      
      if (currentNum == playNum) {
        logMessage('上期结果:中奖了');
        zjCount++;
        money += parseFloat(playMoney * 1.999);
         playMoney = 50;
      } else if (playNum == '') {
         playMoney = 50;
      } else {
        logMessage('上期结果:未中奖');
        zjCount = 0;
        playMoney = playMoney * 2;
      }
      if (playMoney > money) {
        logMessage('没钱了');
        logMessage(playMoney.toString());
        logMessage(money.toString());
        break;
      }
      money -= playMoney;
      let sizeRatio = Math.random() > 0.5 ? 'D' : 'X';
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

async function getCcyData(){
  let res=await http.get('/member/ccyWithdrawInfos')
  console.log(res.data.result[0].exchangeRate);
}

getHistory();
// getCcyData();