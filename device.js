const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const device = new Schema({
    deviceNo: String,
    deviceName: String,
});
const Device = mongoose.model('Device', device);
const saveDevice = async (deviceNo) => {
let existed = await Device.findOne({ deviceNo: deviceNo })
if(existed){ 
  return
}
  let count = await Device.countDocuments()
  let newDevice = new Device({
    deviceNo: deviceNo,
    deviceName: '设备' + (count + 1)
  })
  newDevice.save()
  return newDevice.deviceName
}
const findDevice = async (deviceNo) => {
let existed = await Device.findOne({ deviceNo: deviceNo })
return existed?.deviceName||''
}
module.exports = {
    saveDevice,
    findDevice
}