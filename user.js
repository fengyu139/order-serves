  const mongoose = require('mongoose');
  const cors = require('cors'); // 导入 cors 中间件
const express = require("express");
const bodyParser = require('body-parser');
  mongoose.connect(`mongodb://localhost:27017/user-db`,
  ).then(() => {
    console.log('连接成功');
  }).catch(err => {
    console.log('数据库连接失败', err);
  })
const Schema = mongoose.Schema;
const users = new Schema({
  userName: String,
  password: String,
  balance: Number,
  realName :String,
  expireDate:Date
  
});
const Users = mongoose.model('users', users);
const app = express();
app.use(bodyParser.json({ limit: '200mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '200mb' }));
app.use(cors());
app.post('/api/getUser', async (req, res) => {
    let result=await Users.findOne(req.body)
    res.send({
        data:result
    })
})
// Users.create({
//     userName: 'sk001',
//     password: '123456aa',
//     realName:'烧烤一号',
//     expireDate:new Date('2024-01-30'),
// }).then((result) => {
//     console.log(result);
// })
app.listen(7999, () => {
    console.log('Server running on port 7999');
})
