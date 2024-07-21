const mongoose = require("mongoose");
const dayjs = require('dayjs');
const {updateRecords,deleteRecords,deleteRecordsAll}=require('./orderRecords')
const {saveDevice,findDevice}=require('./device')
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
  isRead:Boolean,
  deviceNo:String,
  merchantID:String
});
const Order = mongoose.model('Order', order);

const orderSave=async(data)=>{
  data.userOperation=!!data.userOperation
  data.createdTime=dayjs().format('YYYY-MM-DD HH:mm:ss');
  data.totalMoney = parseFloat(data.totalMoney.toFixed(2));
  if(data.deviceNo){    
      let deviceName=await findDevice(data.deviceNo)
      console.log(deviceName);
      if(deviceName){
      data.deviceNo=deviceName
    }else{
     let newDeviceName= await saveDevice(data.deviceNo)
     data.deviceNo=newDeviceName
    }
  }
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
    query={orderName:{$regex:query.orderName||''},totalMoney:{$gt:query.searchMoney? Number(query.searchMoney):-1},merchantID:query.merchantID}
  }
  return  Order.find(query).exec();
}
// Order.updateMany({},{merchantID:'1705492345914'}).then((result)=>{
//   console.log(result);
// })
const updateRead=async(id)=>{
  return  Order.updateOne({id},{isRead:true}).exec();
}
const orderDelete=async(id)=>{
  await deleteRecords(id)
  return  Order.deleteOne({id}).exec();
}
const orderDeleteAll=async(id)=>{
  await deleteRecordsAll()
  return  Order.deleteMany({}).exec();
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
      merchantID:query.merchantID
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
  return  Order.find({createdTime:{$gte:query.startTime,$lt:query.endTime}, merchantID:query.merchantID,isFinish:true}).select('orderDetail').exec();
}
const orderTotal=async(query)=>{
  const count = await Order.countDocuments({merchantID:query.merchantID});
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
const oneKeyFinish=async(query)=>{
  const result=await Order.find({isFinish:false,merchantID:query.merchantID})
  result.forEach(async (doc) => {
    doc.isFinish=true
    doc.actualMoney=doc.totalMoney
    // 保存更新后的文档
   await updateRecords({id:doc.id,})
    await doc.save();
  });
  return result
}
const checkOrderStatus=async(data)=>{
  const result=await Order.find({id:data,isFinish:false})
  return result
}
// updateMany()
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
  orderDeleteAll,
  checkOrderStatus
}