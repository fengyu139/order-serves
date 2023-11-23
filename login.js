const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const users = new Schema({
  userName: String,
  password: String,
  balance: Number
});
const jwt = require("jsonwebtoken");
const expressJWT = require("express-jwt");
const secretKey = 'lihaichao';
const noToken=require('./noToken.json')
const Users = mongoose.model('users', users);
module.exports = app => {
 let noTokenList= noToken.map((item)=>{
   return item="/api"+item
  })
  noTokenList.push(/^\/uploads\//)
  // 配置过 express-jwt 可通过 req.auth 获取token信息
  app.use(expressJWT.expressjwt({ secret: secretKey, algorithms: ["HS256"] }).unless({ path: noTokenList }));
  app.use((err, req, res, next) => {
    // 这次错误是由 token 解析失败导致的
    if (err.name === 'UnauthorizedError') {
      return res.send({
        code: 401,
        msg: '登录失效，请重新登录',
      })
    }
    res.send({
      code: 500,
      msg: err,
    })
  })
  app.use((req, res, next) => {
    if(req.headers.authorization){
      jwt.verify(req.headers.authorization.split(" ")[1],secretKey, (err, decode) => {
        if(decode){
         req.userName=decode.name
        }
         next()
       })
       return
    }
    next()
    
  })
  app.post('/api/login', (req, res) => {
    Users.findOne({ userName: req.body.userName }).then((user) => {
      if (!user) {
        return res.send({
          code: 0,
          msg: '用户不存在'
        })
      }
      if (user.password !== req.body.password) {
        return res.send({
          code: 0,
          msg: '密码错误'
        })
      }
      const { userName } = req.body
       const tokenStr = jwt.sign({ name:userName }, secretKey, { expiresIn: '5h' })
        res.send({
          code: 1,
          msg: '登陆成功',
          token: tokenStr
        })
  })
  })
  app.post('/api/register', (req, res) => {
    console.log(req.auth);
    res.send({
      status: 1,
      msg: 'success',
      data: req.auth
    })
  }),
  app.get('/api/balance',async (req, res) => {
    let result=await Users.findOne({ userName: req.userName })
    // let result=await Users.findById('653fb3d55ece09aef1b4e400')
    res.send({
      code: 1,
      msg: 'success',
      data:result.balance
    })
  })
  const probabilities = [
    { value: 0, probability: 60,bonus:0},
    { value: 1, probability: 25,bonus:5 },
    { value: 2, probability: 20 ,bonus:10},
    { value: 3, probability: 18 ,bonus:20},
    { value: 4, probability: 15, bonus:30},
    { value: 5, probability: 10 ,bonus:40},
    { value: 6, probability: 8,bonus:50 },
    { value: 7, probability: 5 ,bonus:60},
  ];
  function generateRandomValue() {
    const totalProbability = probabilities.reduce((sum, item) => sum + item.probability, 0);
    const random = Math.random() * totalProbability;
    let cumulativeProbability = 0;
    for (const item of probabilities) {
      cumulativeProbability += item.probability;
      if (random < cumulativeProbability) {
        return item.value;
      }
    }
    // Fallback in case of rounding errors
    return probabilities[probabilities.length - 1].value;
  }
  app.get('/api/playGame',async (req, res) => {
    let result=await Users.findOne({ userName: req.userName })
    if(result.balance<5){
      return res.send({
        code: 0,
        msg: '余额不足'
      })
    }
    result.balance-=5
   await result.save()
    const randomValue = generateRandomValue();
    if(randomValue!=0){
      result.balance=result.balance+probabilities[randomValue].bonus
      await result.save()
    }
    // let result=await Users.findOne({ userName: req.userName })
    res.send({
      code: 1,
      msg: 'success',
      data:{
        randomValue,
        balance:result.balance
      }
    })
  })
}