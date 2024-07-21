const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const users = new Schema({
  userName: String,
  password: String,
  balance: Number,
  realName : String
});
const jwt = require("jsonwebtoken");
const {findOrder}=require("./mongodb");
const {findMenus,menuSave}=require("./allMenu");
const expressJWT = require("express-jwt");
const secretKey = 'lihaichao';
const noToken=require('./noToken.json')
const axios = require('axios');
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
          req.administrator=decode.name||''
         req.userName=decode.name
        }
         next()
       })
       return
    }
    next()
    
  })
  app.post('/api/login',async (req, res) => {
  let result = await axios.post('http://localhost:7999/api/getUser', { userName: req.body.userName, password: req.body.password })
  let userData=result.data.data
  if(!userData){
    return res.send({
      code: 0,
      msg: '用户名或密码错误'
    })
  };
  if(userData.expireDate&&new Date(userData.expireDate).getTime()<new Date().getTime()){
    return res.send({
      code: 0,
      msg: '账号已到期,请联系供应商'
    })
  }
  const tokenStr = jwt.sign({ name:userData.userName }, secretKey, { expiresIn: '5h' })
    res.send({
      code: 1,
      msg: '登陆成功',
      token: tokenStr,
      data:{
        tokenStr,
        merchantID:userData.merchantID
      }
    })
  //   Users.findOne({ userName: req.body.userName }).then((user) => {
  //     if (!user) {
  //       return res.send({
  //         code: 0,
  //         msg: '用户不存在'
  //       })
  //     }
  //     if (user.password !== req.body.password) {
  //       return res.send({
  //         code: 0,
  //         msg: '密码错误'
  //       })
  //     }
  //     const { userName } = req.body
  //      const tokenStr = jwt.sign({ name:userName }, secretKey, { expiresIn: '5h' })
  //       res.send({
  //         code: 1,
  //         msg: '登陆成功',
  //         token: tokenStr,
  //         data: tokenStr
  //       })
  // })
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
  app.post('/api/authToken',async (req, res) => {
    res.send({
      code: 1,
      msg: 'success',
      data:req.body.token
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
  app.post('/api/userinfo',async (req, res) => {

    let resultData = await axios.post('http://localhost:7999/api/getUser', { userName: req.userName })
    let result=resultData.data.data
    // let result=await Users.findOne({ userName: req.userName })
    // let from={administrator:result.userName,isFinish:true}
    let result2=await findOrder({isFinish:true,merchantID:result.merchantID})
    let totalMoney=result2.reduce((total,item)=>{
      return total+item.totalMoney
    },0)
    let discountedMoney=totalMoney-(result2.reduce((total,item)=>{
      return total+(Number(item.actualMoney)||(Number(item.totalMoney)))
    },0))
    // console.log(result);
     result.password=''
    res.send({
      code: 1,
      msg: 'success',
      data:{...(JSON.parse(JSON.stringify(result))),totalMoney:totalMoney.toFixed(2),discountedMoney:discountedMoney.toFixed(2),orderCount:result2.length}
    })
  })
  app.post('/api/addAccount',async (req, res) => {
    console.log(req.body);
    req.body.merchantID=new Date().getTime()
    if(req.body.syncMerchantID){
     let menuList=await findMenus({merchantID:req.body.syncMerchantID})
     await menuSave(menuList.map(item=>({merchantID:req.body.merchantID,name:item.name,type:item.type,price:item.price,unit:item.unit,isOnline:item.isOnline,picImg:item.picImg})),true)
    }
    try {
      let resultData = await axios.post('http://localhost:7999/api/addAccount', req.body)
      res.send(resultData.data)
    } catch (error) {
      res.send({
        code: 0,
        msg: error.message,
        data:''
      })
    }
   
  })
  app.post('/api/editAccount',async (req, res) => {
    console.log(req.body);
    try {
      let resultData = await axios.post('http://localhost:7999/api/editAccount', req.body)
      res.send({
        code: 1,
        msg: 'success',
        data:''
      })
    } catch (error) {
      res.send({
        code: 0,
        msg: error.message,
        data:''
      })
    }
   
  })
  app.post('/api/getAccount',async (req, res) => {
    console.log(req.body);
    try {
      let resultData = await axios.post('http://localhost:7999/api/getAccount')
      res.send({
        code: 1,
        msg: 'success',
        data:resultData.data.data.map((item)=>{
          return {value:item.userName,text:item.userName,expireDate:item.expireDate,merchantID:item.merchantID}
        })
      })
    } catch (error) {
      res.send({
        code: 0,
        msg: error.message,
        data:''
      })
    }
   
  })
}