const mongoose = require("mongoose");
const dayjs = require('dayjs');
const { v4: uuidv4 } = require('uuid');
const Schema = mongoose.Schema;
const addRecords = new Schema({
  orderId: String,
  id:String,
  items: Array,
  totalMoney: Number,
  totalCount: Number,
  createTime: Date,
  desk:Number,
  isFinish: Boolean,
});
const records = mongoose.model('addRecords', addRecords);
const recordsSave=async(data)=>{
  data.id=uuidv4();
  data.createTime=dayjs().format('YYYY-MM-DD HH:mm:ss');
return  records.insertMany(data);
}
const findRecords=async(query)=>{
  // if(query.type){
  //   return  records.find({...query}).exec();
  // }
  return  records.find(query).exec();
}
const deleteMenu=async(id)=>{
  return  AllMenu.deleteOne({id}).exec();
}
const updateRecords=async(data)=>{
  if(data.isItem){
    return  records.updateMany({id:data.id},{isFinish:data.isFinish}).exec();
  }
  return  records.updateMany({orderId:data.id},{isFinish:true}).exec();
}
module.exports = {
  recordsSave,
  findRecords,
  updateRecords,
}