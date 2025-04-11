// https://dsn3377.com/web/rest/member/dragon/games?count=6
const axios = require('axios');
const http=axios.create({
    baseURL:'https://dsn3377.com/web/rest',
    headers:{
        'Content-Type':'application/json',
        'Cookie':'application/json',
        'Cookie':'affCode=77741; ssid1=8b9d2a5dcd4f8e77b36b0493ebbe91b2; random=5351; _locale_=zh_CN; token=9446a4b18d6191dac713b0bb6105b8bfbbe7be29; 438fda7746e4=9446a4b18d6191dac713b0bb6105b8bfbbe7be29'
    }
})
var timer=null
var excludeArr=['F3D','HK6','FKL8','PL3','PL5','HK6JSC','KLSFJSC']
var playFlag=true
var playArr=[]
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
    let playMoney=playItemObj[data.lottery]?.amount?playItemObj[data.lottery]?.amount*2:100
    if(data.game!=playItemObj[data.lottery]?.game){
        playMoney=100
    }
    if(playMoney==1600){
        playMoney=100
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
    if(playArr.length>0){
        console.log(playArr);
    }
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
   if(balance>4000){
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
    console.log(res.data);
   }
   if(balance<100&&res.data.result.betting<100){
    axios.post('http://154.92.15.136:8000/api/addOrder',{
        "orderName": "余额不足100，停止投注-"+balance,
        "isPack": false,
        "taste": 1,
        "isFinish": false,
        "totalMoney": 0,
        "actualMoney": 0
      })
    clearInterval(timer)
    console.log('❌ 余额不足100，停止投注');
   }
}
getDragon()
timer=setInterval(()=>{
    getBalance()
},85000)