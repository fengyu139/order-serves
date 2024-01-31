  const mongoose = require('mongoose');
  const cors = require('cors'); // 导入 cors 中间件
const express = require("express");
const bodyParser = require('body-parser');
const ipAddress = require("./ipAddress");
const dbUrl1=`mongodb://localhost:27017/user-db`
const dbUrl2=`mongodb://xiaohuzi099:123456aa@localhost:27017/user-db?authSource=admin`
  mongoose.connect(`${ipAddress.substring(0,3)=='192' ? dbUrl1 : dbUrl2}`,
  ).then(() => {
    console.log('user-连接成功');
  }).catch(err => {
    console.log('数据库连接失败', err);
  })
const Schema = mongoose.Schema;
const users = new Schema({
  userName: String,
  password: String,
  balance: Number,
  realName :String,
  expireDate:Date,
  merchantID:String
  
});
const Users = mongoose.model('users', users);
const app = express();
app.use(bodyParser.json({ limit: '200mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '200mb' }));
app.use(cors());
app.post('/api/getUser', async (req, res) => {
  console.log(req.body);
    let result=await Users.findOne(req.body)
    res.send({
        data:result
    })
})
app.post('/api/addAccount', async (req, res) => {
   let hasUser= await Users.findOne({userName:req.body.userName})
   if(hasUser){
    return res.send({
        code: 0,
        msg: '用户已存在',
        data:''
    })
   }
    Users.create(req.body).then((result) => {
    res.send({
        code: 1,
        data:result,
        msg:''
    })
    })
})
app.post('/api/editAccount', async (req, res) => {
    Users.updateOne({userName:req.body.userName},req.body).then((result) => {
    res.send({
        data:result
    })
    })
})
app.post('/api/getAccount', async (req, res) => {
    let result=await Users.find({})
    res.send({
        data:result
    })
})
app.listen(7999, () => {
    console.log('Server running on port 7999');
})
