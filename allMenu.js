const mongoose = require("mongoose");
const { v4: uuidv4 } = require('uuid');
const Schema = mongoose.Schema;
const order = new Schema({
  id: String,
  name: String,
  price: Number,
  type: Number,
  picImg:String,
  isOnline:Boolean,
  count:Number,
  unit:String
});
const AllMenu = mongoose.model('allMenu', order);
const menuSave=async(data)=>{
  if(!Array.isArray(data)){
    data.id=uuidv4();
    data=[data]
  }else{
    data=data.map((item,index)=>{
      item.id=uuidv4();
      return item;
    })
  }
return  AllMenu.insertMany(data);
}
const findMenus=async(query)=>{
  if(query.type){
    return  AllMenu.find({...query}).exec();
  }
  if(query.filter){
    return  AllMenu.find({isOnline:true}).exec();
  }
  return  AllMenu.find({}).exec();
}
const deleteMenu=async(id)=>{
  return  AllMenu.deleteOne({id}).exec();
}
const updateMenu=async(data)=>{
  return  AllMenu.updateOne({id:data.id},{...data}).exec();
}
module.exports = {
  menuSave,
  findMenus,
  updateMenu,
  deleteMenu
}