const mongoose = require("mongoose");
const ipAddress = require("./ipAddress");
const axios = require("axios");
const serverData=require('./serve.json')
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
  var globalSocket=null;
    io.on('connection', (socket) => {
      console.log('socket连接成功');
        globalSocket=socket
        // 处理客户端发送的消息
        socket.on('message', (data) => {
          console.log(`收到消息: ${JSON.stringify(data)}`);
          socket.broadcast.emit('message', data);
          // 广播消息给所有连接的客户端
        });
        socket.on('chat', (data) => {
            data.time=new Date()
            console.log(`收到聊天消息 ${data.name}: ${data.msg}`);
            // 收到聊天消息
            if(data.type === 'img'||data.type === 'file') {
                data.picImg=`http://${ipAddress}:${serverData.httpPort}/`+data.picImg
                data.isRead = false
                io.sockets.emit('chat', data);
                ChatMsg.insertMany(data)
                return
            }
            ChatMsg.insertMany(data)
            socket.broadcast.emit('chat', data);
        })
        socket.on('chatEnter', (data) => {
          socket.broadcast.emit('chatEnter', data);
        })
        socket.on('read',async (data) => {
          socket.broadcast.emit('read', data);
          for (const item of data) {
            let res=await ChatMsg.updateOne({msgId:item.msgId||item},{isRead:true})
          }
        })
        socket.on('chatDelete', (data) => {
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
      app.post('/api/chatSend',async (req, res) => {
       let data={
        "name" : "老胡",
        "type" : "text",
        "picImg" : "",
        "msg" : req.body.msg,
        "time" : null,
        "chatId" : "2",
        "msgId" :new Date().getTime(),
        "isRead" : false
    }
      data.time=new Date()
      console.log(`控制台发送 我: ${data.msg}`);
      // 收到聊天消息
      if(data.type === 'img'||data.type === 'file') {
          data.picImg=`http://${ipAddress}:${serverData.httpPort}/`+data.picImg
          data.isRead = false
          io.sockets.emit('chat', data);
          ChatMsg.insertMany(data)
          return
      }
    if(req.body.msg){
      await ChatMsg.insertMany(data)
      io.sockets.emit('chat', data);
    }
     let records=await ChatMsg.find({}).sort({ time: -1 }).limit(5).exec()
     let str=''
     records.reverse().forEach((item)=>{
       str+=item.name+':'+item.msg+'\n'
     })
      res.send({
          code: 1,
          msg: '发送成功',
          data:str
      })   
      })
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
      
}