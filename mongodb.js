const mongoose = require("mongoose");
const dayjs = require('dayjs');
const Schema = mongoose.Schema;
const order = new Schema({
  id: String,
 orderDetail:Array,
  totalMoney: Number,
  createdTime:Date,
  totalCount:Number,
  showTime:String,
  isPack: Boolean,
  taste:Number,
  orderName:String,
  isFinish:Boolean,
  actualMoney:Number,
  desk:Number,
  undoneRecord:Boolean,
  userOperation:Boolean,
});
const Order = mongoose.model('Order', order);

const orderSave=async(data)=>{
  data.userOperation=!!data.userOperation
  data.createdTime=dayjs().format('YYYY-MM-DD HH:mm:ss');
  const nOrder = new Order(data);
 return  nOrder.save();
}
const findOrder=async(query)=>{
  if(query.startTime&&query.endTime){
    query.createdTime={$gt:query.startTime,$lt:query.endTime}
    delete query.startTime;
    delete query.endTime;
  }
  if(query.orderName){
    query={orderName:{$regex:query.orderName}}
  }
  return  Order.find(query).exec();
}
const updateOrder=(data)=>{
  console.log(data.id);
  return  Order.updateOne({id:data.id},{...data}).exec();
}
const findChart=async(query)=>{
  // return  Order.find({createdTime:{$gte:query.startTime,$lt:query.endTime}}).exec();
  const start=new Date(query.startTime)
  const end=new Date(query.endTime)
  return Order.aggregate([
  {
    $match: {
      createdTime: {
        $gte: start,
        $lt: end,
      },
      isFinish: true,
    },
  },
  {
    $project: {
      year: { $year: '$createdTime' },
      month: { $month: '$createdTime' },
      day: { $dayOfMonth: '$createdTime' },
      totalMoney: 1,
    },
  },
  {
    $group: {
      _id: {
        year: '$year',
        month: '$month',
        day: '$day',
      },
      data: { $sum: '$totalMoney' },
    },
  },
  {
    $sort: {
      '_id.year': 1,
      '_id.month': 1,
      '_id.day': 1,
    },
  },
])
.exec();

}
const findChartPie=(query)=>{
  return  Order.find({createdTime:{$gte:query.startTime,$lt:query.endTime}}).select('orderDetail').exec();
}
const orderTotal=async()=>{
  const count = await Order.countDocuments();
  return  count
}

const updateMany=async()=>{
//  const result=await Order.find({
//     $where: function () {
//       return (this.totalMoney * 100) % 1 !== 0; // 检查小数点后两位是否有值
//     },
//   })
const result=await Order.find({})

  for (const product of result) {
    // 检查小数点后是否有超过2位的小数
    if (typeof product.totalMoney === 'string') {
      console.log(result);
      // 如果小数点后有超过2位的小数，将其四舍五入为两位小数
      product.totalMoney = parseFloat(product.totalMoney);
      // 保存更新后的文档
      await product.save();
    }
  }

  // for (const product of result) {
  //   // 检查小数点后是否有超过2位的小数
  //   if (product.totalMoney % 0.01 !== 0) {
  //     // 如果小数点后有超过2位的小数，将其四舍五入为两位小数
  //     product.totalMoney = parseFloat(product.totalMoney.toFixed(2));
  //     // 保存更新后的文档
  //     await product.save();
  //   }
  // }
}
updateMany()
// Order.deleteMany({totalMoney:undefined}).then((result)=>{
//   console.log(result);
// })
module.exports = {
  orderSave,
  findOrder,
  updateOrder,
  findChart,
  findChartPie,
  orderTotal
}