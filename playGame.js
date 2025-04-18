// https://dsn3377.com/web/rest/member/dragon/games?count=6
const axios = require('axios');
const http=axios.create({
    baseURL:'https://dsn3377.com/web/rest',
    headers:{
        'Content-Type':'application/json',
        'Cookie':'application/json',
        'Cookie':'affCode=77741; _locale_=zh_CN; affid=seo7; ssid1=a844930e80f6018059d276c0d027d65c; random=5920; token=ce3e8202ddf231e02f453219ab4a2c1bffb55879; 438fda7746e4=ce3e8202ddf231e02f453219ab4a2c1bffb55879'
    }
})
var timer=null
var excludeArr=['F3D','HK6','FKL8','PL3','PL5','HK6JSC','KLSFJSC']
var playFlag=true
var playArr=[]
var curMoney=0
var playItemObj={}
async function playGame(data){
    let playKey=data.dragonGameBetCount.find(item=>item.key.split('_')[1]!=data.contents)?.key
    let aAndB=''
    for (const key in data.dragonGameOdds) {
       if(data.dragonGameOdds[key]==playKey){
        aAndB=key.substring(0,1)
       }
       
    }
    if(data.drawNumber==playItemObj[data.lottery]?.drawNumber){
        return
    }
    let playMoney=playItemObj[data.lottery]?.amount?playItemObj[data.lottery]?.amount*2:50
    if(data.game!=playItemObj[data.lottery]?.game){
        playMoney=50
    }
    if(playMoney==400){
        playMoney=50
    }
    let bets=[]
         bets.push({
            "amount": playMoney,
            "contentText":data.dragonGameOdds[`${aAndB}OddsText`],
            "contents":playKey.split('_')[1],
            "drawNumber": data.drawNumber,
            "game": data.game,
            "ignore": "false",
            "lottery": data.lottery,
            "odds": data.dragonGameOdds[`${aAndB}Odds`],
          })
        const {drawTime,currentTime}=data.period
        setTimeout(() => {
            getDragon()
        }, drawTime-currentTime+20000);
        try {
        let res=await http.post('/member/dragon/bet',{bets})
        playItemObj[data.lottery]=bets[0]
        } catch (error) {
            playItemObj={}
            console.log(error.config.data);
            console.log(error.response.data);
        }
}
//获取长龙数据
async function getDragon(){
    let res=await http.get('/member/dragon/games?count=13')
    let dragonArr=res.data.result.filter(item=>!excludeArr.includes(item.lottery))
    playArr=dragonArr.map(item=>item.lottery)
   for (const key in playItemObj) {
    if(!playArr.includes(key)){
        delete playItemObj[key]
    }
   }
   if(!playFlag){
    let curFlag=dragonArr.some(item=>item.rank>12)
    playFlag=curFlag
   }
   if(playFlag&&playArr.length>0){
    playGame(dragonArr[0])
   }
   if(playArr.length==0){
    setTimeout(()=>{
        getDragon()
    },90000)
   }
}
async function getBalance(){
    let res=await http.get('/member/accountbalance')
   let balance= res.data.result.balance
   if(curMoney==0){
    curMoney=balance
   }
   if(balance>6000){
    console.log('✅ 盈利线了');
    // playFlag=false
    let resWithdraw=await http.get('/member/ccyWithdrawInfos')
    let currencyRate= resWithdraw.data.result[0].exchangeRate;
    let res=await http.post('/member/withdrawl',{
        "cardid": "TSCkYFxFmpzTfKjGqZboGmSw2eXaAf2oEB",
        "drawCode": "309709",
        "drawamount": "3000",
        "currency": "USDT",
        "currencyRate": currencyRate,
        "transChannel": 0
    })
    console.log(res.data);
   }
   if(balance<50&&res.data.result.betting<50){
    axios.post('http://154.92.15.136:8000/api/addOrder',{
        "orderName": "余额不足50，停止投注-"+balance,
        "isPack": false,
        "taste": 1,
        "isFinish": false,
        "totalMoney": 0,
        "actualMoney": 0
      })
    clearInterval(timer)
    console.log('❌ 余额不足50，停止投注');
   }
}
getDragon()
timer=setInterval(()=>{
    getBalance()
},85000)

// 设置每天晚上12点执行的方法
function scheduleMidnightTask() {
    const now = new Date();
    const night = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1, // 明天
        0, // 0点
        0, // 0分
        0  // 0秒
    );
    const msToMidnight = night.getTime() - now.getTime();
    // 设置定时器，在午夜执行
    setTimeout(() => {
        midnightTask();
        // 设置下一天的定时器
        scheduleMidnightTask();
    }, msToMidnight);
}

// 午夜要执行的具体任务
async function midnightTask() {
    try {
        let res=await http.get('/member/accountbalance')
        let balance= res.data.result.balance
        console.log('今日收益', balance-curMoney);
        curMoney=balance
    } catch (error) {
        console.error('午夜任务执行出错：', error);
    }
}

// 启动午夜任务调度
scheduleMidnightTask();