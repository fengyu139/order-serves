const mongoose = require("mongoose");
const { v4: uuidv4 } = require('uuid');
// const sharp = require('sharp');
const Schema = mongoose.Schema;
const order = new Schema({
  id: String,
  name: String,
  price: Number,
  type: Number,
  picImg:String,
  isOnline:Boolean,
  count:Number,
  unit:String,
  merchantID:String
});
const AllMenu = mongoose.model('allMenu', order);
const menuSave=async(data,flag)=>{
  if(!Array.isArray(data)){
    data.id=uuidv4();
    if(!flag){
      let newUrl=await cutOffImg(data.picImg)
      if(newUrl){data.picImg=newUrl}
    }
    data=[data]
  }else{
    // console.log(data);
    data=data.map( (item,index)=>{
      item.id=uuidv4();
      // if(!flag){ 
      //   let newUrl=await cutOffImg(item.picImg)
      //   if(newUrl){item.picImg=newUrl}
      // }
      return item;
    })
  }
  console.log(data);
return  AllMenu.insertMany(data);
}

const findMenus=async(query)=>{
  if(query.type){
    return  AllMenu.find({...query}).exec();
  }
  if(query.filter){
    return  AllMenu.find({isOnline:true,merchantID:query.merchantID}).exec();
  }
  return  AllMenu.find({merchantID:query.merchantID}).exec();
}
const deleteMenu=async(id)=>{
  return  AllMenu.deleteOne({id}).exec();
}
const updateMenu=async(data)=>{
 let newUrl=await cutOffImg(data.picImg)
if(newUrl){data.picImg=newUrl}
  return  AllMenu.updateOne({id:data.id},{...data}).exec();
}
// AllMenu.updateMany({},{merchantID:'1705492345914'}).then((result)=>{
//   console.log(result);
// })
async function cutOffImg(imagePath){
  if(!imagePath){
    return
  }
  return imagePath
//   let res=await  sharp(`./${imagePath}`).metadata()
//   console.log(res);
//  let forMat=res.format
//   if(res.width!=res.height){
//     let cutOffWidth=0
//     let cutOffLeft=0
//     let cutOffTop=0
//     if(res.width>res.height){
//         cutOffWidth=res.height
//         cutOffTop=0
//         cutOffLeft=parseInt((res.width-res.height)/2)
//     }else{
//         cutOffWidth=res.width
//         cutOffLeft=0
//         parseInt
//         cutOffTop=parseInt( (res.height-res.width)/2)
//     }
//     const cropOptions = {
//         left: cutOffLeft,    // 左边距
//         top: cutOffTop,      // 上边距
//         width: cutOffWidth,   // 裁剪宽度
//         height: cutOffWidth    // 裁剪高度
//       };
//     let cutImg=`./uploads/${Date.now()}_cutImg.${forMat}`
//     let newRes=await sharp(imagePath).extract(cropOptions).toFile(cutImg)
//     console.log(newRes);
//     return cutImg.slice(2)
  // }

}
module.exports = {
  menuSave,
  findMenus,
  updateMenu,
  deleteMenu
}