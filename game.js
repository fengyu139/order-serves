const axios = require('axios');
const http=axios.create({
    baseURL:'https://dsn3377.com/web/rest',
    headers:{
        'Content-Type':'application/json',
        'Cookie':'application/json',
        'Cookie':'affCode=77741; ssid1=e2f2eddb6b171de8c3eee53b21f32df6; random=8584; _locale_=zh_CN; token=12dd85030aaa830127babf7bf55a869e0e9eaac5; 438fda7746e4=12dd85030aaa830127babf7bf55a869e0e9eaac5'
    }
})
// 提款接口 https://dsn3377.com/web/rest/member/withdrawl
// 参数
// {
//   "cardid": "TSCkYFxFmpzTfKjGqZboGmSw2eXaAf2oEB",
//   "drawCode": "309709",
//   "drawamount": "1800",  
//   "currency": "USDT",
//   "currencyRate": 7.43,
//   "transChannel": 0
// }
var winMoney=0
var playFlag=false
var playCount=0
var gBalance=0
var currentNum=0
var playMoney=25
async function getBalance(){
    let res=await http.get('/member/accountbalance')
   return res.data.result
}
async function getLottery(){
    let res=await http.post('/member/multiplePeriod',{
        "periodRequests": [
          {
            "lottery": "SGFT"
          }
        ]
      })
      let res2=await http.get('/member/resulthistory?lottery=SGFT')
      let openArr=res2.data.result.slice(10,20).map(item=>item.result.split(',')[0])
    //   console.log([...new Set(openArr)]);
      // 计算大小比例并返回结果
    return {...res.data.result[0],playNum:['1','2','3','4','5','6','7','8','9','10'].filter((item)=>!openArr.includes(item))}
}
var gNumArr=
function generateNumbers() {
    // 生成包含6个1-10不重复随机数的数组,并转换为字符串
    const numbers = new Set();
    while(numbers.size < 6) {
        numbers.add(Math.floor(Math.random() * 10) + 1);
    }
    return Array.from(numbers).map(item => item.toString());
}

function countOccurrences(arr) {
    const counts = {};
    arr.forEach(num => {
        counts[num] = (counts[num] || 0) + 1;
    });
    return counts;
}

async function playLottery(){
    const {result,balance}=await getBalance()
    // console.log(parseInt(balance-gBalance));
    // if(parseInt(balance-gBalance)<-1620&&balance>1){
    //     console.log('止损线了，停止投注');
    //     return
    // }
  //   if(parseInt(balance-gBalance)>2399&&balance>1){
  //     console.log('✅ 盈利线了，停止投注');
  //     init()
  //     return
  // }
  if(parseInt(balance-gBalance)<-1550){
    console.log('❌ 亏损1550，停止一会儿');
   return
  }
  if(parseInt(balance-gBalance)>winMoney&&balance>1){
    playFlag=false
    playCount=0
    // gBalance=balance
    console.log('✅ 盈利线了，停止一会儿，等下次的时机');
    let resWithdraw=await http.get('/member/ccyWithdrawInfos')
    let currencyRate= resWithdraw.data.result[0].exchangeRate;
    if(balance>3000){
      let res=await http.post('/member/withdrawl',{
        "cardid": "TSCkYFxFmpzTfKjGqZboGmSw2eXaAf2oEB",
        "drawCode": "309709",
        "drawamount": "1000",
        "currency": "USDT",
        "currencyRate": currencyRate,
        "transChannel": 0
    })
    console.log(res.data);
    gBalance=balance-1000
    }
    return
  }
    // let numArr=generateNumbers()
    const {drawNumber,currentTime,drawTime,playNum,lastNum}=await getLottery()
    if(Number(drawNumber.slice(-3))>65&&Number(drawNumber.slice(-3))<73){
      console.log('今天结束了');
      return 
  }
    let bets=[]
    playNum.forEach(item=>{
        bets.push({
            "amount": 50,
            "contentText": item,
            "contents": item,
            "drawNumber": drawNumber,
            "game": "B1",
            "groupText": "1 ~ 10名",
            "ignore": "false",
            "lottery": "SGFT",
            "odds": 9.93,
            "rowText": "冠军"
          },)
    })
    if(playNum[0]&&balance>50){
       try{
        let res=await http.post('/member/dragon/bet',{bets})
        console.log(drawNumber);
       }catch(err){
        console.log(balance);
        axios.post('http://154.92.15.136:8000/api/addOrder',{
          "orderName": "爆仓了-请尽快处理-"+balance,
          "isPack": false,
          "taste": 1,
          "isFinish": false,
          "totalMoney": 0,
          "actualMoney": 0
        })
       }
    }
    if(balance<50){
      axios.post('http://154.92.15.136:8000/api/addOrder',{
        "orderName": "余额不足50，停止投注-"+balance,
        "isPack": false,
        "taste": 1,
        "isFinish": false,
        "totalMoney": 0,
        "actualMoney": 0
      })
      console.log('余额不足50，停止投注');
      return
    }
    setTimeout(()=>{
        playLottery()
    },drawTime-currentTime+60000+Math.random()*20000)
}
async function init(){
   const{balance}=await getBalance()
    gBalance=balance
}

// 添加一个在每天早上8点启动playLottery的函数
function schedulePlayLotteryAt8AM() {
  winMoney=Math.floor(Math.random() * (1500 - 1000 + 1)) + 1000
  const now = new Date();
  let scheduledTime = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    8, 21, 0, 0 // 设置为早上8:21:00
  );
  
  // 如果当前时间已经过了今天的8点20，就设置为明天的8点20
  if (now > scheduledTime) {
    scheduledTime.setDate(scheduledTime.getDate() + 1);
  }
  
  const timeUntil8AM = scheduledTime.getTime() - now.getTime()+Math.random()*1000*60*60;
  console.log(`将在${scheduledTime.toLocaleString()}启动投注（${Math.floor(timeUntil8AM/1000/60)}分钟后）`);
  // 设置定时器在8点启动playLottery
  setTimeout(() => {
    console.log('现在是早上8点21分，开始投注');
    playFlag=false
    init()
    playLottery();
    // 设置下一天的8点定时器
   setTimeout(()=>{
    schedulePlayLotteryAt8AM();
   },3000)
  }, timeUntil8AM);
}

init()
// 替换原来的直接调用playLottery的代码
schedulePlayLotteryAt8AM();
setTimeout(()=>{
  playLottery();
},4000)
setInterval(async()=>{
    await getBalance()
},90000)
// setInterval(async()=>{
//    let res=await getBalance()
//    console.log(res.balance); 
// },10800000)