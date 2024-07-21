const jwt = require("jsonwebtoken");
const secretKey = 'lihaichao';
function logger(req, res, next) {
    const time = new Date();
    let noLog=['/api/getMenu','/api/orderList','/api/chatSend']
    let userName=''
    if(req.headers.authorization){
        jwt.verify(req.headers.authorization.split(" ")[1],secretKey, (err, decode) => {
          if(decode){
           userName=decode.name
          }
         })
      }
    if(!noLog.includes(req.url)&&!req.url.includes('uploads')){
        console.log(`[${time.toLocaleString()}]----${userName} ------${req.method} ----- ${req.url}-----${req.headers['user-agent']}---${req.ip}---body:${JSON.stringify(req.body)}---query:${JSON.stringify(req.query)}`);
    }
    next();
  }
  
  module.exports = logger;