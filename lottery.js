const mongoose = require("mongoose");
const logger = require('./log4jsLogger');
const Schema = mongoose.Schema;
const openRecords = new Schema({
  issue: String,
  drawResult: String,
  drawTime: String,
  code: String,
});
const OpenRecords = mongoose.model('openRecords', openRecords);
const axios = require('axios');
axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
axios.defaults.headers.post['Device'] = 4;
axios.defaults.headers.post['Token'] = '1e7420990175404b81592921246f01421702535203020';
axios.defaults.headers.get['Token'] = '1e7420990175404b81592921246f01421702535203020';
module.exports = app => {
  app.get('/api/lottery', async (req, res) => {
   try {
    let result=await axios.get('https://kclm.site/api/trial/drawResult',{
      params: {
        code:'cctxffc',
        format:'json',
        rows:req.query.rows,
      },
    })
    res.send({
      code:1,
      msg:'success',
      data:result.data.data
    })
   } catch (error) {
     console.error(error);
   }
  })
let timer=null
function generateUniqueRandomNumbers(min, max, count) {
  if (max - min + 1 < count) {
    throw new Error("范围内不够唯一数字可用");
  }

  const numbers = [];
  while (numbers.length < count) {
    const randomNum = Math.floor(Math.random() * (max - min + 1)) + min;
    if (!numbers.includes(randomNum)) {
      numbers.push(randomNum);
    }
  }

  return numbers.sort((a, b) => a - b);
}
function findTopThreeFrequentElements(arr) {
  // 使用对象来存储元素及其出现次数的映射
  const elementCountMap = {};

  // 遍历数组，统计元素出现次数
  arr.forEach(element => {
    elementCountMap[element] = (elementCountMap[element] || 0) + 1;
  });

  // 将映射转换为包含元素和出现次数的数组
  const elementCountArray = Object.entries(elementCountMap);

  // 按出现次数降序排序
  elementCountArray.sort((a, b) => b[1] - a[1]);

  // 获取前三个元素
  const topThreeElements = elementCountArray.slice(0, 3);

  // 返回结果
  return topThreeElements.map(entry => ({ element: entry[0], count: entry[1] }));
}

// 示例
app.get('/api/stop', async (req, res) => {
clearInterval(timer)
clearInterval(timer2)
  res.send({
    code:1,
    msg:'success',
  })
})
var balance=0
var expected=0
var money=0
var checkbox=false
var defaultMoney=0
app.get('/api/start', async (req, res) => {
  if(req.query.token){
    axios.defaults.headers.post['Token'] = req.query.token;
    axios.defaults.headers.get['Token'] =  req.query.token;
    money=Number(req.query.money)
    ylCount=money/2
    checkbox=req.query.checkbox=='true'

  }
  expected=Number(req.query.expected)
  axios.post('https://cgcpapitp2p2.aengae4.com:10151/boracay/member/front/userInfo', {
    code:'cctxffc',
    format:'json',
    rows:1,
  }).then(res=>{  
      balance=Number(res.data.data.balance)
      logger.info(res.data.data.balance)
  })

  clearInterval(timer)
  clearInterval(timer2)
  timer2=setInterval(async ()=>{
    queryInfo()
  },60000)
  timer= setInterval(() => {
   toPaly()
  }, 60000);
    res.send({
      code:1,
      msg:'success',
    })
  })
  function queryInfo(){
    axios.post('https://cgcpapitp2p2.aengae4.com:10151/boracay/member/front/userInfo').then(res=>{
      logger.info(res.data.data.balance)
      logger.info(Number(res.data.data.balance)-balance);
      if(Number(res.data.data.balance)-balance>expected){
        logger.warn('可以了');
        clearInterval(timer)
        clearInterval(timer2)
      }
    })
    // let result=await axios.get('https://kclm.site/api/trial/drawResult',{
    //   params: {
    //     code:'cctxffc',
    //     format:'json',
    //     rows:1,
    //   },
    // })
  }
  var timer2= setInterval(async ()=>{
    queryInfo()
  },70000)
  var ylCount=0
  async function toPaly (){
   
  let issue=await axios.get('https://cgcpapitp2p2.aengae4.com:10151/coron/ticketmod/currentSaleIssue.json?ticketIds=57')
  let codeNum=generateUniqueRandomNumbers(1, 10, 3)
  let formData={
    'ticketId': 67,
    'planNo': issue.data.data[0].planId,

  }
  let minKey=await getScBdRecords() 
  codeNum.forEach((item,index)=>{
    formData[`bet[${index}].playId`]=6702010100+Number(item);
    formData[`bet[${index}].betNum`]=Number(item);
    formData[`bet[${index}].betAmount`]=money||1;
    formData[`bet[${index}].betCount`]=1;
    formData[`bet[${index}].content`]=Number(item);
  })
  
  formData.orderSource= 2;
  console.warn(formData);
   let res=await axios.post('https://cgcpapitp2p2.aengae4.com:10151/coron/order/double/create',formData)
   if(res.data.code==0){
    logger.info('下注成功');
    logger.info(formData)
    return
   }
   if(res.data.code==10020||res.data.code==3){
    logger.info('余额不足,停止自动下注');
    clearInterval(timer)
    clearInterval(timer2)
    return
   }
   console.log(res.data);
 }
//  极速赛车
  async function getScRecords(){
    let records=await axios({
      url: 'https://cgcpapitp2p2.aengae4.com:10151/coron/api/ticketSourceResult/ticketSourceResultList.json',
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      method: 'post',
      data: {
        num:6,//设置数据遗漏个数
        ticketId:67
      }
    })
    let totalRecords=records.data.data.map(item=>{
      return item.code.split(' ').splice(0,2).reduce((a,b)=>{
        return Number(a)+ Number(b)
      },0)
    })
  return totalRecords.filter(item=>{
    return item>11
  }).length
  //  return records.data.data
  }
  // 极速快三
  async function getKsRecords(){
  let res= await axios.get('https://cawsapitp2p1.k1b0in94.com/coron/trendGraph/chart/history?ticketId=50&num=100')
  let ksArr=['1','2','3','4','5','6']
  let num=20
  for (let index = 0; index < 5; index++) {
    num+=num*2
    
  }
  let numObj={}
  let ylObj={}
  let ylNum=[]
  ksArr.forEach(item6=>{
    ylObj[item6]=0
  })
  let num10=res.data.data.slice(0,8)
  num10.forEach((item4)=>{
    let setArr= [...new Set(item4.code.split(','))]
    ksArr.forEach((item5)=>{
      if(setArr.includes(item5)){
        ylObj[item5]=ylObj[item5]?ylObj[item5]+1:1
      }
    })
  })
  res.data.data.forEach((item,index)=>{
    let setArr= [...new Set(item.code.split(','))]
    setArr.forEach((item1)=>{
      numObj[item1]=numObj[item1]?numObj[item1]+1:1
    })
  })
  console.log(numObj);
  console.log(ylObj);
  }
  // getScRecords()
//  getKsRecords()
//  toPaly()
var tzNum=[]
async function getScBdRecords(){
  let records=await axios({
    url: 'https://cgcpapitp2p2.aengae4.com:10151/coron/api/ticketSourceResult/ticketSourceResultList.json',
    headers: {
      'Content-Type': 'application/json;charset=UTF-8',
    },
    method: 'post',
    data: {
      num:100,//设置数据遗漏个数
      ticketId:57
    }
  })
  // let totalRecords=records.data.data.map(item=>{
  //   return item.code.split(' ').splice(0,2).reduce((a,b)=>{
  //     return Number(a)+ Number(b)
  //   },0)
  // })
  // let totalRecords=records.data.data.map(item=>{
  //   return item.code.split(' ')[0]
  // })
  var numObj={}
  for (let index = 0; index < 10; index++) {
   let fIndex= records.data.data.findIndex(item=>{
      return item.code.split(' ')[0]==index
    })
    numObj[index]=fIndex
  
  }

  console.log(numObj);
  function findTwoMaxKeys(obj) {
    let maxKey1 = null;
    let maxKey2 = null;
    let maxValue1 = -Infinity;
    let maxValue2 = -Infinity;
  
    for (let key in obj) {
      if (obj.hasOwnProperty(key) && typeof obj[key] === 'number') {
        const value = obj[key];
  
        if (value > maxValue1) {
          // 将当前最大值移到第二大
          maxValue2 = maxValue1;
          maxKey2 = maxKey1;
  
          // 更新最大值
          maxValue1 = value;
          maxKey1 = key;
        } else if (value > maxValue2) {
          // 更新第二大值
          maxValue2 = value;
          maxKey2 = key;
        }
      }
    }
  
    return [maxKey1, maxKey2];
  }
  function arrayDifference(arr1, arr2) {
    return arr1.filter(item => !arr2.includes(item))
      .concat(arr2.filter(item => !arr1.includes(item)));
  }
  // 调用函数找到两个最大值的键
  let result = findTwoMaxKeys(numObj).map(Number);
  let arrNum=[0,1,2,3,4,5,6,7,8,9,0,1,2,3,4,5,6,7,8,9]
  let kjNum=Number(records.data.data[0].code.split(' ')[0])
  console.log(kjNum+'____'+tzNum);
  if(tzNum.includes(kjNum)){
    console.log('中奖了-----------');
  }else{
    console.log('再接再厉哦');
  }
  let kjNum2=arrNum.slice(kjNum+1,kjNum+6).filter(item=>{
    return !result.includes(Number(item))
  })
  tzNum = kjNum2
  console.log('差集：', tzNum);
}
var timer3=null
clearInterval(timer3)
// getScBdRecords()
// timer3=setInterval(() => {
//   getScBdRecords()
// }, 1000*60);
function calculateIntervals(arr) {
  let intervals = [];
  let lastIndex = -1;

  for (let i = 0; i < arr.length; i++) {
    if (arr[i] >11) {
      if (lastIndex !== -1) {
        intervals.push(i - lastIndex);
      }
      lastIndex = i;
    }
  }

  return intervals;
}

// 示例数组
// let myArray = [1, 2, 3, 4, 2, 5, 2, 6, 7, 2, 8, 9, 2, 10];

// 计算数字 2 出现的间隔
// let intervals = calculateIntervals(myArray);

// setInterval(() => {
//     getScBdRecords()
// },10);
// console.log( minKey);
// toPaly()
}
