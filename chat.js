const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Chat = new Schema({
    name: String,
    type: String,
    picImg:String,
    msg: String,
    time: Date,
    chatId: String
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
                let url='http://154.92.15.136:8000/'
                data.picImg='http://127.0.0.1:8000/'+data.picImg
                io.sockets.emit('chat', data);
                ChatMsg.insertMany(data)
                return
            }
            ChatMsg.insertMany(data)
            socket.broadcast.emit('chat', data);
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
}