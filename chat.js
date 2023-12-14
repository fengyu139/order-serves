const mongoose = require("mongoose");
const ipAddress = require("./ipAddress");
const axios = require("axios");
const Schema = mongoose.Schema;
const Chat = new Schema({
    name: String,
    type: String,
    picImg:String,
    msg: String,
    time: Date,
    chatId: String,
    msgId: String,
    isRead: Boolean
});
const ChatMsg = mongoose.model('ChatMsg', Chat);
module.exports =(io,app)=> {
    io.on('connection', (socket) => {
        // 处理客户端发送的消息
        socket.on('message', (data) => {
          console.log(`收到消息: ${JSON.stringify(data)}`);
          socket.broadcast.emit('message', data);
          // 广播消息给所有连接的客户端
        });
        socket.on('chat', (data) => {
            data.time=new Date()
            console.log(`收到聊天消息: ${JSON.stringify(data)}`);
            // 收到聊天消息
            if(data.type === 'img'||data.type === 'file') {
                data.picImg=`http://${ipAddress}:8000/`+data.picImg
                data.isRead = false
                io.sockets.emit('chat', data);
                ChatMsg.insertMany(data)
                return
            }
            ChatMsg.insertMany(data)
            socket.broadcast.emit('chat', data);
        })
        socket.on('chatEnter', (data) => {
          console.log(data);
          socket.broadcast.emit('chatEnter', data);
        })
        socket.on('read',async (data) => {
          console.log(data);
          socket.broadcast.emit('read', data);
          for (const item of data) {
            let res=await ChatMsg.updateOne({msgId:item.msgId||item},{isRead:true})
            console.log(res);
          }
        })
        socket.on('chatDelete', (data) => {
          console.log(data);
          io.sockets.emit('chatDelete', data);
          ChatMsg.deleteOne({msgId:data}).then(res=>{
            console.log(res);
          }).catch(err=>{
            console.log(err);
          })
        })
        // 处理客户端断开连接
        socket.on('disconnect', () => {
          // console.log('一个客户端断开连接');
        });
      });
      app.get('/api/chatList',async (req, res) => {
        const {pageSize,pageNum}=req.query
        const skip = (pageNum - 1) * pageSize;
       let data=await ChatMsg.find({}).sort({ time: -1 }).skip(skip).limit(pageSize).exec()
          res.send({
              code: 1,
              data:data.reverse(),
              msg: '获取成功'
          })
      })
      var token='YlGfFJAf1S0sECCXL81osC9TfQZ5d_hrzYv-PDqyxyA=.eyJ1IjoxMjY2ODAsImEiOjExMDAyMTAsInQiOiIyNzk2MmZhNjQwYWI0ZDI3IiwiayI6MX0='
      var baseUrl='https://sy3.sy88103.com/APIV2/GraphQL?l=zh-cn&pf=h5&udid=1902b249-a350-4a96-a53e-14caf7a5b3e5&ac=hzm099'
      var balance=0
      var playName=''
      var playCount=1
      var currentBalance=0
      var radioVal='1'
      app.get('/api/sYstart', async (req, res) => {
        token = req.query.token
        radioVal=req.query.radioVal
        console.log(req.query);
      await getHistory()
       await getBalance(true)
        start()
        clearInterval(timer1)
        timer1=setInterval(async ()=>{
          start()
         },1000*60)
        res.send({
          code: 1,
          msg: '成功'
        })
      });
      app.get('/api/sYstop', async (req, res) => {
       clearInterval(timer1)
        res.send({
          code: 1,
          msg: '成功'
        })
      });
      function generateUniqueRandomNumbers(min, max, count) {
        if (max - min + 1 < count) {
          throw new Error("范围内不够唯一数字可用");
        }
      
        const numbers = [];
        while (numbers.length < count) {
          let randomNum = Math.floor(Math.random() * (max - min + 1)) + min;
          if (!numbers.includes(randomNum)) {
            //小于10前面补0
            if(randomNum<10){
               randomNum=randomNum.toString().padStart(2,'0')
            }
            numbers.push(randomNum);
          }
        }
      
        return numbers
      }
async function getNowId(){
  let data = JSON.stringify({
    "operationName": "GetLotteryCycle",
    "variables": {
      "game_id": 218,
      "row_count": 3
    },
    "query": "query GetLotteryCycle($game_id: Int!, $row_count: Int) {\n  LotteryGame(game_id: $game_id) {\n    game_id\n    game_value\n    base_game\n    official_website\n    lottery_cycle_now {\n      now_cycle_id\n      now_cycle_value\n      now_cycle_count_down\n      last_cycle_value\n      last_cycle_game_result\n      future_cycle_list {\n        cycle_id\n        cycle_value\n        __typename\n      }\n      __typename\n    }\n    lottery_result_history(row_count: $row_count) {\n      cycle_value\n      game_result\n      open_time\n      extra_context {\n        hash\n        block\n        __typename\n      }\n      __typename\n    }\n    extra_info {\n      trxbh_account_from\n      trxbh_account_to\n      trxbh_URL\n      __typename\n    }\n    __typename\n  }\n}\n"
  });
  let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: baseUrl,
    headers: { 
      'Authorization': token, 
      'Content-Type': 'application'
    },
    data : data
  };
  
  let res=await axios.request(config)
//   let history2= res.data.data.LotteryGame.lottery_result_history.slice(0,2).map(item=>{
//     return item.game_result
//   })
//   playName=''
//   let filterHistory=history2.filter(item=>{
//     return item[0]<item[4]
//   })
//   let filterHistory2=history2.filter(item=>{
//     return item[0]>item[4]
//   })
//   console.log(filterHistory,filterHistory2);
//   if(radioVal=='1'){
//       //顺龙
//   if(filterHistory.length==2){
//     playName='tiger'
//   }
//   if(filterHistory2.length==2){
//     playName='dragon'
//   }
//   }
//   if(radioVal=='2'){
//      //反龙
//   if(filterHistory.length==0){
//     playName='tiger'
//   }
//   if(filterHistory2.length==0){
//     playName='dragon'
//   }
//   }
//   if(playCount==4){
//     playCount=1
//   }
//   if(filterHistory2.length&&filterHistory.length){
//     playCount=1
//   }
//  if(playName==''){
//   return
//  }
 return res.data.data.LotteryGame.lottery_cycle_now.now_cycle_id
}
function paly(game_cycle_id){
  if(!game_cycle_id){
    return
  }
  let orders=[]
  let numArr=generateUniqueRandomNumbers(1,10,4)
  tzNum.forEach(element => {
    orders.push({
      "game_id": 218,
      "game_type_id": 65,
      "bet_info": "[[\""+element+"\"],[],[],[],[]]",
      "bet_multiple": 30,
      "game_cycle_id": game_cycle_id,
      "bet_percent_type": "AdjustPercentType",
      "bet_percent": 0
    })
  });



  // orders.push( {
  //   "game_id": 218,
  //   "game_type_id": 123,
  //   "bet_info": "[[\""+playName+"\"]]",
  //   "bet_multiple": 100*playCount,
  //   "game_cycle_id": game_cycle_id,
  //   "bet_percent_type": "AdjustPercentType",
  //   "bet_percent": 0
  // })


  // {
  //   "operationName": "AddLotteryTwoSideOrder",
  //   "variables": {
  //     "orders": [
  //       {
  //         "game_id": 218,
  //         "game_type_id": 123,
  //         "bet_info": "[[\"tiger\"]]",
  //         "bet_multiple": 10,
  //         "game_cycle_id": 16231640,
  //         "bet_percent_type": "AdjustPercentType",
  //         "bet_percent": 0
  //       }
  //     ]
  //   },
  //   "query": "mutation AddLotteryTwoSideOrder($orders: [AddLotteryOrderInputObj]) {\n  AddLotteryTwoSideOrder(orders: $orders)\n}\n"
  // }
  // console.log(orders);
  let data = JSON.stringify({
    query: `mutation AddLotteryTwoSideOrder($orders: [AddLotteryOrderInputObj]) {\n  AddLotteryTwoSideOrder(orders: $orders)\n}\n`,
    variables: {"orders":orders}
  });
  let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: baseUrl,
    headers: { 
      'Authorization': token, 
      'Content-Type': 'application'
    },
    data : data
  };
  
  axios.request(config)
  .then((response) => {
    console.log(JSON.stringify(response.data));
    if(response.data.errors&&response.data.errors[0].error_code==10047){
      // let newData=JSON.parse(data)
      // newData.variables.orders[0].bet_multiple=currentBalance
      // config.data=JSON.stringify(newData)
      // axios.request(config).then((response2)=>{
      //   console.log(JSON.stringify(response2.data));
      // })
      // if(currentBalance<1){
        // clearInterval(timer1)
      // }
    };
    playCount++
  })
  .catch((error) => {
    console.log(error+'-------------------');
  });
}
async function getBalance(flag){
  let data=JSON.stringify({
      "operationName": "getUserBalance",
      "variables": {
        "product_id": "Enum1"
      },
      "query": "query getUserBalance($product_id: ProductEnum) {\n  User {\n    id\n    user_balance(product_id: $product_id)\n    __typename\n  }\n}\n"
    
  })
  let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: baseUrl,
    headers: { 
      'Authorization': token, 
      'Content-Type': 'application'
    },
    data : data
  };
  
 let res=await axios.request(config)
 console.log('速盈台子的余额：'+res.data.data.User.user_balance);
 //舍弃小数点后面的数字

 currentBalance=Math.floor(Number(res.data.data.User.user_balance)) 
 if(flag){
  balance=res.data.data.User.user_balance
  return
 }
 if(res.data.data.User.user_balance-balance>1299){
  clearInterval(timer1)
  // toWithdraw()
 }
 
}
async function toWithdraw(){
  let data=JSON.stringify({
      "operationName": "addWithdrawOrder",
      "variables": {
        "bank_id": 18826,
        "withdraw_amount": 1500,
        "balance_password": "123456bb",
        "product_id": "Enum1",
        "auth_code": "",
        "google_verify_code": "",
        "payment_type": 1,
        "user_cryptocurrency_id": null
      },
      "query": "mutation addWithdrawOrder($bank_id: Int, $withdraw_amount: Int, $balance_password: String, $product_id: ProductEnum, $auth_code: String, $google_verify_code: String, $payment_type: Int, $user_cryptocurrency_id: Int, $wallet_type: FinanceWalletTypeEnum) {\n  AddWithdrawOrder(\n    bank_id: $bank_id\n    withdraw_amount: $withdraw_amount\n    balance_password: $balance_password\n    product_id: $product_id\n    auth_code: $auth_code\n    google_verify_code: $google_verify_code\n    payment_type: $payment_type\n    user_cryptocurrency_id: $user_cryptocurrency_id\n    wallet_type: $wallet_type\n  )\n}\n"

})
  let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: baseUrl,
    headers: { 
      'Authorization': token, 
      'Content-Type': 'application'
    },
    data : data
  }
  let res=await axios.request(config)
  console.log(res.data);

}

// getBalance()
// toWithdraw()
var timer1=null
async function start(){
  getBalance()
  let nowId=await getNowId()
  await getHistory()
  //随机生成1到30的数字
  let random= Math.floor(Math.random()*10)
  setTimeout(() => {
    paly(nowId)
  }, random*1000);
}
var tzNum=[]
async function getHistory(){
  let data = JSON.stringify({
    "operationName": "GetLotteryCycle",
    "variables": {
      "game_id": 218,
      "row_count": 50
    },
    "query": "query GetLotteryCycle($game_id: Int!, $row_count: Int) {\n  LotteryGame(game_id: $game_id) {\n    game_id\n    game_value\n    base_game\n    official_website\n    lottery_cycle_now {\n      now_cycle_id\n      now_cycle_value\n      now_cycle_count_down\n      last_cycle_value\n      last_cycle_game_result\n      future_cycle_list {\n        cycle_id\n        cycle_value\n        __typename\n      }\n      __typename\n    }\n    lottery_result_history(row_count: $row_count) {\n      cycle_value\n      game_result\n      open_time\n      extra_context {\n        hash\n        block\n        __typename\n      }\n      __typename\n    }\n    extra_info {\n      trxbh_account_from\n      trxbh_account_to\n      trxbh_URL\n      __typename\n    }\n    __typename\n  }\n}\n"
  });
  let config = {
    method: 'post',
    maxBodyLength: Infinity,
    url: baseUrl,
    headers: { 
      'Authorization': token, 
      'Content-Type': 'application'
    },
    data : data
  };
  
  let arrNum=[0,1,2,3,4,5,6,7,8,9,0,1,2,3,4,5,6,7,8,9]
  let res=await axios.request(config)
  var numObj={}
  for (let index = 0; index < 10; index++) {
   let fIndex= res.data.data.LotteryGame.lottery_result_history.findIndex(item=>{
      return item.game_result[0]==index
    })
    numObj[index]=fIndex
  
  }

  // console.log(numObj);
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
   // 调用函数找到两个最大值的键
  let result = findTwoMaxKeys(numObj).map(Number);
  let kjNum=Number(res.data.data.LotteryGame.lottery_result_history[0].game_result[0])
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
  //
  // let history2= res.data.data.LotteryGame.lottery_result_history.map(item=>{
  //   return item.game_result.slice(0,3).toString()
  // })
  // let history2= res.data.data.LotteryGame.lottery_result_history.map(item=>{
  //   return item.game_result.slice(0,3)
  // })
  // let arr=[]
  // 每个好嘛出现的次数
  // for (let index = 0; index < 10; index++) {
  //   console.log(history2.flat().filter(item=>{
  //     return item==index
  //   }).length+'------------'+index);
    
  // }
 
  // let duplicates = findDuplicates(history2);
// console.log("重复项: ", duplicates);
}
var timer2=null
clearInterval(timer2)
// getHistory()
// timer2=setInterval(() => {
//   getHistory()
// }, 1000*60);
//筛选出数组重复项
function findDuplicates(array) {
  let uniqueElements = new Set();
  let duplicates = new Set();

  for (let element of array) {
      if (uniqueElements.has(element)) {
          duplicates.add(element);
      } else {
          uniqueElements.add(element);
      }
  }

  return Array.from(duplicates);
}
}