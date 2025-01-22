const axios = require('axios');
const dayjs = require('dayjs');
const http = axios.create({
    baseURL: 'https://dsn3377.com',
    timeout: 5000,
    headers: {
        'Content-Type': 'application/json',
        'Cookie': 'affCode=77741; _locale_=zh_CN; ssid1=7c4c9defcfbf330f2fe8069e007777de; random=391; token=718560d05bc14b3ebbf4397dc202922b7d5f6b18; 438fda7746e4=718560d05bc14b3ebbf4397dc202922b7d5f6b18'
    }
});
var initMoney=0;
var playMoney=25;
function generateRandomNumbers(excludeNumbers) {
    // 创建1-10的数组，排除传入的数字
    const numbers = Array.from({length: 10}, (_, i) => i + 1)
        .filter(num => !excludeNumbers.includes(num));
    
    // 打乱数组
    for (let i = numbers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [numbers[i], numbers[j]] = [numbers[j], numbers[i]];
    }
    
    // 返回前3个数字
    return numbers.slice(0, 7);
}
function getTopThreeFrequent(arr) {
    // 统计每个元素出现的次数
    const countMap = arr.reduce((acc, curr) => {
        acc[curr] = (acc[curr] || 0) + 1;
        return acc;
    }, {});
    
    const total = arr.length;
    
    // 将统计结果转换为数组并排序
    const sortedItems = Object.entries(countMap)
        .sort((a, b) => b[1] - a[1])
        .slice(6, 9)
        .map(item => ({
            number: item[0],
            count: item[1],
            percentage: ((item[1] / total) * 100).toFixed(2) + '%'
        }));
    
    return sortedItems;
}
const playLottery = async () => {
    const res4=await http.get('/web/rest/member/accountbalance');
    let balance=(res4.data.result.balance);
    if(balance-initMoney>1988){
        console.log('可以了，达到盈利目标了');
        return;
    }
    console.log(balance-initMoney);
    const res =await http.post('/web/rest/member/multiplePeriod', {
     
            "periodRequests": [
              {
                "lottery": "XYFT"
              }
            ]
          
    });
    const { drawNumber, currentTime, drawTime } = res.data.result[0]
    const res2 = await http.get('/web/rest/member/lastResult?lottery=XYFT');
    const currentNum=Number(res2.data.result.result.split(',')[0]);
    const lastNum=Number(res2.data.result.result.split(',')[9]);
    const numArr = generateRandomNumbers([currentNum,8]).map((i)=>i.toString());
    const res5 = await http.get(`/web/rest/member/resulthistory?lottery=XYFT`);
    let historyArr = res5.data.result.slice(0, 3).map(item => Number(item.result.split(',')[0]));
    // const numArr = getTopThreeFrequent(historyArr);
    let playCode='';
    if(historyArr.every(item=>item<6)&&historyArr.length>2){
        playCode='D';
        playMoney=playMoney*2;
    }else if(historyArr.every(item=>item>5)&&historyArr.length>2){
        playCode='X';
        playMoney=playMoney*2;
    }else{
        playCode='';
        playMoney=25
    }
    let bets=[{
        "amount": playMoney,
        "contentText":  playCode=='D'?'大':'小',
        "contents": playCode,
        "drawNumber": drawNumber,
        "game": "DX1",
        "groupText": "两面",
        "ignore": "false",
        "lottery": "XYFT",
        "odds": 1.999,
        "rowText": "冠军"
      }]
   if(playCode!==''){
    const res3=await http.post('/web/rest/member/dragon/bet', {
        bets
      });
      console.log("玩了"+playCode+"金额"+playMoney);
   }else{
    console.log('不玩');
   }
    setTimeout(()=>{
        playLottery();
    },drawTime-currentTime+Math.random()*60000+30000);
}
async function init(){
    const res4=await http.get('/web/rest/member/accountbalance');
    initMoney=res4.data.result.balance;
    playLottery();
}
init();

