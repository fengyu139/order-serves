const axios=require('axios')
let boldArr=[
    {matchId: 1, biFen:['2-0','1-1'],data:{},name:'克罗地亚'},
    {matchId: 2, biFen:['2-3','1-2'],data:{},name:'德国'},
    {matchId: 2, biFen:['1-3','3-0'],data:{},name:'瑞士'},
]
let playCount=5
let isRandom=false
//https://iapi.bbapsell.com/v1/order/betMultiple
async function testFun(){
    for (const iterator of boldArr) {
        let res=await axios.post('https://fbapi.vtech1.com/v1/match/getMatchDetail',{
            "matchId": iterator.matchId,
            "languageType": "CMN",
          })
          iterator.data=res.data.data.mg
          if(isRandom){
            let currentItem=iterator.data.find (item => item.mty==1099&&item.pe==1001)
            let currentFilter=currentItem.mks[0].op.filter(item=>!item.nm.includes('4')&&Number(item.od)<120&&item.nm!='其他')
            iterator.biFen.forEach((item,index)=>{
              iterator.biFen[index]=currentFilter[Math.floor(Math.random()*currentFilter.length)].nm
            })
          }
    }
}
async function getList(){
    const now = new Date();
    // Asia/Shanghai
    //Europe/Berlin
    const options = { timeZone: 'Europe/Berlin' };
    const startOfDay = new Date(new Intl.DateTimeFormat('en-US', { ...options, hour: 'numeric', hour12: false, minute: 'numeric', second: 'numeric', year: 'numeric', month: 'numeric', day: 'numeric' }).format(now));
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(startOfDay);
    endOfDay.setHours(23, 59, 59, 999);
        let res=await axios.post('https://fbapi.vtech1.com/v1/match/getList',{
            "orderBy": 0,
            "isPC": false,
            "type": 3,
            "beginTime": null,
            "endTime": null,
            "leagueIds": null,
            "sportId": 1,
            "leagueId": "19788",
            "current": 1,
            "size": 50,
            "noNeedResponseMsg": true,
            "oddsChange": 1,
            "currencyId": 1,
            "languageType": "CMN"
          })
    boldArr.forEach((item,index)=>{
        item.matchId=res.data.data.records.find(record=>record.nm.includes(item.name)).id
    })
    }
async function playBet(combinations){
    for (const iterator of combinations) {
        let res=await axios.post('https://fbapi.vtech1.com/v1/order/betMultiple',{
            "betMultipleData": [
              {
                "itemCount": boldArr.length,
                "oddsChange": 2,
                "seriesValue": boldArr.length,
                "unitStake": playCount
              }
            ],
            "betOptionList": iterator,
            "currencyId": 1,
            "languageType": "CMN"
          },{
            headers: { 
                'Authorization': 'tt_1br2guwvQHRPSOi3iGYfFsmOKYGxzYDn.b50601a5d5c04dc9ff7c93bdcbf7392d', 
              },
          })
          console.log(iterator);
    }
}
( async ()=>{
    await getList()
    await testFun()
let combinations = boldArr.reduce((acc, match) => {
    return acc.flatMap(comb => match.biFen.map(score => [...comb, score]));
}, [[]]);
    combinations.forEach(element => {
        element.forEach((item,index) => {
           let currentItem=boldArr[index].data.find (item => item.mty==1099&&item.pe==1001)
           let currentOdds=currentItem.mks[0].op.find(opItem=>opItem.na==item).od
           let currentOptionType=currentItem.mks[0].op.find(opItem=>opItem.na==item).ty
           element[index]= {
                "marketId":currentItem.mks[0].id,
                "odds": currentOdds,
                "optionType": currentOptionType,
                "oddsFormat": 1
              }
        });
    });
    playBet(combinations);
})()