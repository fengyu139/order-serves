// https://dsn3377.com/web/rest/member/dragon/games?count=6
const axios = require('axios');
const http=axios.create({
    baseURL:'https://dsn3377.com/web/rest',
    headers:{
        'Content-Type':'application/json',
        'Cookie':'application/json',
        'Cookie':'affCode=77741; _locale_=zh_CN; affid=seo7; ssid1=85b381a69062250cb329e0634931754d; random=7515; token=ed6b4faa8e6bee07691f01fd9c6073e317578230; 438fda7746e4=ed6b4faa8e6bee07691f01fd9c6073e317578230'
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
        try {
        let res=await http.post('/member/dragon/bet',{bets})
        playItemObj[data.lottery]=bets[0]
        } catch (error) {
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
   if(playFlag){
    dragonArr.forEach(item=>{
        playGame(item)
    })
    if(playArr.length>0){
        console.log(playArr);
    }
   }
}
async function getBalance(){
    let res=await http.get('/member/accountbalance')
   let balance= res.data.result.balance
   if(balance>6000){
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
    clearInterval(timer)
    console.log('❌ 余额不足100，停止投注');
   }
}
getDragon()
timer=setInterval(()=>{
    getBalance()
    getDragon()
},85000)