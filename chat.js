const mongoose = require("mongoose");
const ipAddress = require("./ipAddress");
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
      // ChatMsg.updateMany({},{isRead:true}).then(res=>{
      //   console.log(res);
      // })
}