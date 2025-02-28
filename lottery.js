const axios = require('axios');
const http=axios.create({
    baseURL:'https://dsn3377.com/web/rest',
    headers:{
        'Content-Type':'application/json',
        'Cookie':'affCode=77741; ssid1=270ffd155e991b2e213ef0165b1f8c0a; random=4103; _locale_=zh_CN; affid=seo7; token=686bfd929d21f345f7863a697774a83455cf9f58; 438fda7746e4=686bfd929d21f345f7863a697774a83455cf9f58'
    }
})
var gBalance=0
var currentNum=0
var playMoney=20
async function getBalance(){
    let res=await http.get('/member/accountbalance')
   return res.data.result
}
async function getLottery(){
    let res=await http.post('/member/multiplePeriod',{
        "periodRequests": [
          {
            "lottery": "PK10JSC"
          }
        ]
      })
      let res2=await http.get('/member/resulthistory?lottery=PK10JSC')
      let openArr=res2.data.result.map(item=>item.result.split(',')[0])
      console.log(`已开：${openArr.length}期`);
      let openCounts=countOccurrences(openArr.splice(1,openArr.length-1))
      console.log(openCounts);
      // 将统计结果转换为数组并排序
      const sortedCounts = Object.entries(openCounts)
        .sort((a, b) => b[1] - a[1]);
      // 找出最大和第二大的出现次数
      const maxCount = sortedCounts[0]?.[1] || 0;
      const secondMax = sortedCounts.find(([, count]) => count < maxCount)?.[1] || 0;
      // 收集所有出现次数为最大和第二大的数字
      const maxNumbers = sortedCounts.filter(([, count]) => count === maxCount);
      const secondMaxNumbers = sortedCounts.filter(([, count]) => count === secondMax);
      console.log('最多出现:', maxNumbers.map(n => `${n[0]}（${n[1]}次）`).join(', '));
      console.log('第二多出现:', secondMaxNumbers.length 
        ? secondMaxNumbers.map(n => `${n[0]}（${n[1]}次）`).join(', ')
        : '无');
    let res3=await http.get(`/member/lastResult?lottery=PK10JSC`)
    let lastNum=res3.data.result.result.split(',')[0]
    return {...res.data.result[0],playNum:[maxNumbers[0][0]],lastNum:lastNum}
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
    console.log(parseInt(balance-gBalance));
    let numArr=generateNumbers()
    const {drawNumber,currentTime,drawTime,playNum,lastNum}=await getLottery()
    if(lastNum==currentNum){
        playMoney=20
        console.log('中奖了');
        setTimeout(()=>{
            playLottery()
        },150000)
        return
    }
    let bets=[]
    playMoney=playMoney+15
    playNum.forEach(item=>{
        bets.push({
            "amount": playMoney,
            "contentText": item,
            "contents": item,
            "drawNumber": drawNumber,
            "game": "B1",
            "groupText": "1 ~ 10名",
            "ignore": "false",
            "lottery": "PK10JSC",
            "odds": 9.93,
            "rowText": "冠军"
          })
    })
    currentNum=playNum[0]
    let res=await http.post('/member/dragon/bet',{bets})
    setTimeout(()=>{
        playLottery()
    },drawTime-currentTime+10000+Math.random()*20000)
}
async function init(){
   const{balance}=await getBalance()
    gBalance=balance
}
init()
playLottery()