const axios = require('axios');
const http=axios.create({
    baseURL:'https://dsn3377.com/web/rest',
    headers:{
        'Content-Type':'application/json',
        'Cookie':'application/json',
        'Cookie':'affCode=77741; ssid1=84b4260e9b6f2c951923e19810fd2cfd; random=4975; affid=seo7; _locale_=zh_CN; token=0da7af41bc37365469bdcc3850ad2f379ee60b91; 438fda7746e4=0da7af41bc37365469bdcc3850ad2f379ee60b91'
    }
})
var playFlag=false
var playCount=0
var gBalance=0
var currentNum=0
var playMoney=50
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
      let openArr=res2.data.result.slice(2,17).map(item=>item.result.split(',')[0])

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

      // 计算大小比例结果
      const sizeRatio = calculateSizeRatio(openArr);
    //   console.log('大小比例结果:', sizeRatio);

      let openCounts=countOccurrences(openArr.splice(1,openArr.length-1))
    //   console.log(openCounts);
      // 将统计结果转换为数组并排序
      const sortedCounts = Object.entries(openCounts)
        .sort((a, b) => b[1] - a[1]);
      // 找出最大和第二大的出现次数
      const maxCount = sortedCounts[0]?.[1] || 0;
      const secondMax = sortedCounts.find(([, count]) => count < maxCount)?.[1] || 0;
      // 收集所有出现次数为最大和第二大的数字
      const maxNumbers = sortedCounts.filter(([, count]) => count === maxCount);
      const secondMaxNumbers = sortedCounts.filter(([, count]) => count === secondMax);
    let res3=await http.get(`/member/lastResult?lottery=SGFT`)
    let lastNum=res3.data.result.result.split(',')[0]<6?'X':'D'
    if(sizeRatio==''){
        playMoney=50
    }
    return {...res.data.result[0],playNum:[sizeRatio],lastNum:lastNum}
}
var gNumArr=['1','2','3','4','5','6','7','8','9','10']
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
  if(parseInt(balance-gBalance)>1300&&balance>1){
    playFlag=false
    playCount=0
    gBalance=balance
    console.log('✅ 盈利线了，停止一会儿，等下次的时机');
  }
    let numArr=generateNumbers()
    const {drawNumber,currentTime,drawTime,playNum,lastNum}=await getLottery()
    console.log(drawNumber);
    if(drawNumber.slice(-3)==='070'){
        playMoney=50
        console.log('今天结束了');
        console.log(balance);
        return 
    }
    if(lastNum==currentNum){
        playMoney=50    
        playCount=0
    }
    if(playMoney==400){
        playMoney=50  
    }
    let bets=[]
    playMoney=playMoney*2
    playCount++
    if(playCount>5){
        playFlag=true
    }
    playNum.forEach(item=>{
        bets.push({
            "amount": playMoney,
            "contentText": item==='X'?'小':'大',
            "contents": item,
            "drawNumber": drawNumber,
            "game": "DX1",
            "groupText": "两面",
            "ignore": "false",
            "lottery": "SGFT",
            "odds": 1.999,
            "rowText": "冠军"
          })
    })
    currentNum=playNum[0]
    if(playNum[0]&&playFlag){
        let res=await http.post('/member/dragon/bet',{bets})
    }
    setTimeout(()=>{
        playLottery()
    },drawTime-currentTime+10000+Math.random()*20000)
}
async function init(){
   const{balance}=await getBalance()
    gBalance=balance
}

// 添加一个在每天早上8点启动playLottery的函数
function schedulePlayLotteryAt8AM() {
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
  
  const timeUntil8AM = scheduledTime.getTime() - now.getTime();
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
},120000)
setInterval(async()=>{
   let res=await getBalance()
   console.log(res.balance); 
},10800000)