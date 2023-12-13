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
      var token='7IcsYfSYYzY4G1Ot8kWRLb0jw4eQ4nMCRSWB58rihyM=.eyJ1IjoxMjY2MTAsImEiOjEwOTk2MTgsInQiOiI0ZjFiZDg1YTExNmNhOTVhIiwiayI6MX0='
      var baseUrl='https://888.syhb16.com/APIV2/GraphQL?l=zh-cn&pf=h5&udid=3844f21c-9ec8-40df-bad2-172b02911cb7&ac=hzm521'
      var balance=0
      var playName=''
      var playCount=1
      var currentBalance=0
      var radioVal='1'
      app.get('/api/sYstart', async (req, res) => {
        token = req.query.token
        radioVal=req.query.radioVal
        console.log(req.query);
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
      "row_count": 30
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
  let history2= res.data.data.LotteryGame.lottery_result_history.slice(0,2).map(item=>{
    return item.game_result
  })
  playName=''
  let filterHistory=history2.filter(item=>{
    return item[0]<item[4]
  })
  let filterHistory2=history2.filter(item=>{
    return item[0]>item[4]
  })
  console.log(filterHistory,filterHistory2);
  if(radioVal=='1'){
      //顺龙
  if(filterHistory.length==2){
    playName='tiger'
  }
  if(filterHistory2.length==2){
    playName='dragon'
  }
  }
  if(radioVal=='2'){
     //反龙
  if(filterHistory.length==0){
    playName='tiger'
  }
  if(filterHistory2.length==0){
    playName='dragon'
  }
  }
  if(playCount==4){
    playCount=1
  }
  if(filterHistory2.length&&filterHistory.length){
    playCount=1
  }
 if(playName==''){
  return
 }
 return res.data.data.LotteryGame.lottery_cycle_now.now_cycle_id
}
function paly(game_cycle_id){
  if(!game_cycle_id){
    return
  }
  let orders=[]
  let numArr=generateUniqueRandomNumbers(1,10,4)
  // numArr.forEach(element => {
  //   orders.push({
  //     "game_id": 169,
  //     "game_type_id": 6,
  //     "bet_info": "[[\""+element+"\"],[],[],[],[]]",
  //     "bet_multiple": 2,
  //     "game_cycle_id": game_cycle_id,
  //     "bet_percent_type": "AdjustPercentType",
  //     "bet_percent": 0
  //   })
  // });
  orders.push( {
    "game_id": 218,
    "game_type_id": 123,
    "bet_info": "[[\""+playName+"\"]]",
    "bet_multiple": 100*playCount,
    "game_cycle_id": game_cycle_id,
    "bet_percent_type": "AdjustPercentType",
    "bet_percent": 0
  })
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
  console.log(orders);
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
      let newData=JSON.parse(data)
      newData.variables.orders[0].bet_multiple=currentBalance
      config.data=JSON.stringify(newData)
      axios.request(config).then((response2)=>{
        console.log(JSON.stringify(response2.data));
      })
      if(currentBalance<1){
        clearInterval(timer1)
      }
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
  toWithdraw()
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
  //随机生成1到30的数字
  let random= Math.floor(Math.random()*10)
  setTimeout(() => {
    paly(nowId)
  }, random*1000);
}
  // var benjin=1000
  // //随机生成0和1
  // while(benjin>0){
  //   let random= Math.floor(Math.random()*2)
  //   benjin=benjin-100
  //   if(random==1){
  //     benjin=benjin+(100*1.992)
  //   }
    
  //   console.log(benjin);
  // }
  
// start()
// (async () => {
//   // toWithdraw()
//  await getBalance(true)
//   start()
//   timer1=setInterval(async ()=>{
//     start()
//    },1000*60)
// })()
}