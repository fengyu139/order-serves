// https://dsn3377.com/web/rest/member/dragon/games?count=6
const axios = require('axios');
const http=axios.create({
    baseURL:'https://dsn3377.com/web/rest',
    headers:{
        'Content-Type':'application/json',
        'Cookie':'application/json',
        'Cookie':'affCode=77741; ssid1=8b9d2a5dcd4f8e77b36b0493ebbe91b2; random=5351; _locale_=zh_CN; affid=seo7; token=172f7757af99cde07ed7332ed5ae84f3473bcc6c; 438fda7746e4=172f7757af99cde07ed7332ed5ae84f3473bcc6c'
    }
})
var timer=null
var excludeArr=['F3D','HK6','FKL8','PL3','PL5','HK6JSC','KLSFJSC']
var playFlag=true
var playArr=[]
var playItemObj={}
var playMoney=50
async function playGame(data){
    let playKey=data.dragonGameBetCount.find(item=>item.key.split('_')[1]==data.contents)?.key
    let aAndB=''
    for (const key in data.dragonGameOdds) {
       if(data.dragonGameOdds[key]==playKey){
        aAndB=key.substring(0,1)
       }
       
    }
    if(data.drawNumber==playItemObj[data.lottery]?.drawNumber){
        return
    }
    for (const key in playItemObj) {
        if(key==data.lottery){
            playMoney=25
        }
    }
    playMoney=playMoney*2
    if(data.game==playItemObj[data.lottery]?.game){
        playMoney=50
    }
    if(playMoney==800){
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
    let res=await http.get('/member/dragon/games?count=9')
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
   if(balance>2500){
    console.log('✅ 盈利线了');
    playFlag=false
    let resWithdraw=await http.get('/member/ccyWithdrawInfos')
    let currencyRate= resWithdraw.data.result[0].exchangeRate;
    let res=await http.post('/member/withdrawl',{
        "cardid": "TSCkYFxFmpzTfKjGqZboGmSw2eXaAf2oEB",
        "drawCode": "309709",
        "drawamount": "1000",
        "currency": "USDT",
        "currencyRate": currencyRate,
        "transChannel": 0
    })
    const randomHours = Math.floor(Math.random() * (6 - 3 + 1)) + 3; // 生成3到6之间的随机整数
    const randomMilliseconds = randomHours * 60 * 60 * 1000; // 转换为毫秒
    setTimeout(() => {
        playFlag=true
    }, randomMilliseconds)
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