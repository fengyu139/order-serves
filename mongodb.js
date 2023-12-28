const mongoose = require("mongoose");
const dayjs = require('dayjs');
const {updateRecords}=require('./orderRecords')
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
  takeMeal:Number,
  isAddMenu:Boolean,
  administrator:String,
  isRead:Boolean
});
const Order = mongoose.model('Order', order);

const orderSave=async(data)=>{
  console.log(data);
  data.userOperation=!!data.userOperation
  data.createdTime=dayjs().format('YYYY-MM-DD HH:mm:ss');
  data.totalMoney = parseFloat(data.totalMoney.toFixed(2));
  const nOrder = new Order(data);
 return  nOrder.save();
}
const findOrder=async(query)=>{
  if(query.startTime&&query.endTime){
    query.createdTime={$gt:query.startTime,$lt:query.endTime}
    delete query.startTime;
    delete query.endTime;
  }
  if(query.orderName||query.searchMoney){
    query={orderName:{$regex:query.orderName||''},totalMoney:{$gt:query.searchMoney? Number(query.searchMoney):0}}
  }
  return  Order.find(query).exec();
}
const updateRead=async(id)=>{
  return  Order.updateOne({id},{isRead:true}).exec();
}
const orderDelete=async(id)=>{
  return  Order.deleteOne({id}).exec();
}
const updateOrder=(data)=>{
  if(data.totalMoney){
    data.totalMoney = data.totalMoney?parseFloat(Number(data.totalMoney).toFixed(2)):0;
  }
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
const result=await Order.find({ totalMoney: { $exists: true, $type: 'number' } })
result.forEach(async (doc) => {
  // 更新字段值为保留两位小数
  doc.totalMoney = parseFloat(doc.totalMoney.toFixed(2));
  // 保存更新后的文档
  await doc.save();
});
}
const oneKeyFinish=async()=>{
  const result=await Order.find({isFinish:false})
  result.forEach(async (doc) => {
    doc.isFinish=true
    doc.actualMoney=doc.totalMoney
    // 保存更新后的文档
   await updateRecords({id:doc.id,})
    await doc.save();
  });
  return result
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
  orderTotal,
  orderDelete,
  oneKeyFinish,
  updateRead,
}