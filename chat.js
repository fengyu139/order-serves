const mongoose = require("mongoose");
const os = require('os');
const axios = require('axios');
// 获取网络接口列表
const networkInterfaces = os.networkInterfaces();
// 找到第一个非内部地址的 IPv4 地址
const ipAddress = Object.values(networkInterfaces)
  .flat()
  .filter((iface) => iface.family === 'IPv4' && !iface.internal)
  .map((iface) => iface.address)[0];
console.log('Server IP Address:', ipAddress);
const Schema = mongoose.Schema;
const Chat = new Schema({
    name: String,
    type: String,
    picImg:String,
    msg: String,
    time: Date,
    chatId: String,
    msgId: String
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
      var token='o1kRAi9Dsrf6X060ILJAAeUe4XcFiZM1_YPP37e33lY=.eyJ1IjoxMjY2MTAsImEiOjEwOTU2MjEsInQiOiI3MTc3NzM2YWVlZDgwMmI1IiwiayI6MX0='
      var baseUrl='https://888.syhb13.com/APIV2/GraphQL?l=zh-cn&pf=h5&udid=1902b249-a350-4a96-a53e-14caf7a5b3e5&ac=hzm521'
      var balance=0
      app.get('/api/sYstart', async (req, res) => {
        token = req.query.token
        getBalance()
        start()
        timer1=setInterval(async ()=>{
          start()
         },1000*60*5)
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
      "game_id": 169,
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
 return res.data.data.LotteryGame.lottery_cycle_now.now_cycle_id
}
function paly(game_cycle_id){
  let orders=[]
  let numArr=generateUniqueRandomNumbers(1,10,4)
  numArr.forEach(element => {
    orders.push({
      "game_id": 169,
      "game_type_id": 6,
      "bet_info": "[[\""+element+"\"],[],[],[],[]]",
      "bet_multiple": 38,
      "game_cycle_id": game_cycle_id,
      "bet_percent_type": "AdjustPercentType",
      "bet_percent": 0
    })
  });
  let data = JSON.stringify({
    query: `mutation AddLotteryTwoSideOrder($orders: [AddLotteryOrderInputObj]) {
    AddLotteryTwoSideOrder(orders: $orders)
  }`,
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
  })
  .catch((error) => {
    console.log(error);
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
 if(res.data.data.User.user_balance-balance>499){
  clearInterval(timer1)
 }
 if(flag){
  balance=res.data.data.User.user_balance
 }
}
getBalance()
var timer1=null
async function start(){
  getBalance()
  let nowId=await getNowId()
  //随机生成1到30的数字
  let random= Math.floor(Math.random()*30)
  setTimeout(() => {
    paly(nowId)
  }, random*1000);
}
// (async ()=>{
//  timer1=setInterval(async ()=>{
//   start()
//  },1000*60*5)
//   // var benjin=1000
//   // //随机生成0和1
//   // while(benjin>0){
//   //   let random= Math.floor(Math.random()*2)
//   //   benjin=benjin-100
//   //   if(random==1){
//   //     benjin=benjin+(100*1.992)
//   //   }
    
//   //   console.log(benjin);
//   // }
// })()
}