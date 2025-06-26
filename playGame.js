// https://dsn3377.com/web/rest/member/dragon/games?count=6
const axios = require('axios');
const http=axios.create({
    baseURL:'https://dsn3377.com/web/rest',
    headers:{
        'Content-Type':'application/json',
        'Cookie':'ssid1=1a5c659f28559664b2f70d7b8a2595b7; random=4356; token=c017cc0a76ffbc849789fff34fc8e4fb54a7057e; 438fda7746e4=c017cc0a76ffbc849789fff34fc8e4fb54a7057e'
    }
})
var ranksNum=Math.floor(Math.random()*(17-10+1))+10
var timer=null
var dragonTimer=null  // 添加新的定时器变量
var excludeArr=['F3D','HK6','FKL8','PL3','PL5','HK6JSC','KLSFJSC']
var playFlag=true
var playArr=[]
var curMoney=0
var playItemObj={}
var isRunning = true  // 添加运行状态控制
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
    // if (!isRunning) return;  // 检查运行状态
    
    try {
        let res=await http.get(`/member/dragon/games?count=10`)
        let dragonArr=res.data.result.filter(item=>!excludeArr.includes(item.lottery)).filter(item=>item.rank<14)
        playArr=dragonArr.map(item=>item.lottery)
        
        // 清理不存在的彩票数据
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
            await playGame(dragonArr[0])
        }
        
        if(playArr.length==0 && isRunning){
            // 清除之前的定时器
            if (dragonTimer) {
                clearTimeout(dragonTimer)
            }
            dragonTimer = setTimeout(()=>{
                getDragon()
            },90000)
        }
    } catch (error) {
        console.error('获取长龙数据出错：', error)
        // 发生错误时也设置重试
        if (isRunning) {
            dragonTimer = setTimeout(()=>{
                getDragon()
            },90000)
        }
    }
}
async function getBalance(){
    try {
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

} catch (error) {
    console.log(error?.config?.data);
    console.log(error?.response?.data);
}
}
getDragon()
timer=setInterval(async ()=>{
    try {   
     await getBalance()
    } catch (error) {
    console.log(error);
    }
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
        console.log('今日收益:', balance-curMoney);
        axios.post('http://154.92.15.136:8000/api/addOrder',{
        "orderName": `今日收益:${parseInt(balance-curMoney)},当前余额:${curMoney}`,
        "isPack": false,
        "taste": 1,
        "isFinish": false,
        "totalMoney": 0,
        "actualMoney": 0
      })
        curMoney=balance
        
    } catch (error) {
        console.error('午夜任务执行出错：', error);
    }
}

// 启动午夜任务调度
scheduleMidnightTask();

// 清理函数
function cleanup() {
    isRunning = false;
    if (dragonTimer) {
        clearTimeout(dragonTimer);
        dragonTimer = null;
    }
    playItemObj = {};
    playArr = [];
}
setInterval(()=>{
    ranksNum=Math.floor(Math.random()*(17-10+1))+10 // 生成8到15之间的随机数
},1000*60*60*6)
// 添加进程退出处理
process.on('SIGINT', () => {
    console.log('正在清理资源...');
    cleanup();
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('正在清理资源...');
    cleanup();
    process.exit(0);
});