module.exports = app => {
  console.log(app.get);
  const mongoose = require('mongoose');
  // 在使用“FindAndDupDate（）”和“FindAndDelete（）”时，将useFindAndModify设置为false，否则会报错
  // server-database数据库名称，会自动创建
  // mongoose.set('useFindAndModify', false);
  mongoose.connect('mongodb://localhost:27017/server-database ',
  // mongoose.connect('mongodb://xiaohuzi099:123456aa@154.92.15.136:27017/server-database?authSource=admin',
//mongodump 154.92.15.136:27017 xiaohuzi099 123456aa admin -o /www/mongoData
  // mongodb://xiaohuzi099:123456aa@localhost:27017/?authSource=admin
      // useCreateIndex: true,       // 解决弃用警告
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
  ).then(() => {
    // console.log('连接成功');
  }).catch(err => {
    console.log('数据库连接失败', err);
  })
  app.get('/', (req, res) => {
    res.send('<h1>22222222</h1>');
  })
}
// mongodb://154.92.15.136:27017/
//mongodb://xiaohuzi099:123456aa@154.92.15.136:27017/?authSource=admin