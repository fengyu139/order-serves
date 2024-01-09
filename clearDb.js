const {orderDeleteAll} = require('./mongodb');
module.exports = async ()=>{
    (async ()=>{
        console.log('开始清空数据库');
       let res= await orderDeleteAll()
        console.log('清空数据库成功');
        console.log(res);
    })()
}