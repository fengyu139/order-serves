const {orderDelete,oneKeyFinish}=require("./mongodb");
const ipAddress = require("./ipAddress");
const qrCode = require('qrcode');
const sharp = require('sharp');
module.exports = app => {
    app.post('/api/orderDelete', async (req, res) => {
      try {
    let result=  await orderDelete(req.body.id);
      console.log('删除成功---'+req.body.id);
      res.send({
        code: 1,
        msg: 'success',
        data: result
      });
      } catch (error) {
        console.log(error);
        res.send({
            code: 0,
            msg: error,
            data: ''
          });
      }
    })
    app.post('/api/oneKeyFinish', async (req, res) => {
      try {
    await oneKeyFinish(req.body.id);
      console.log('一键完成成功---');
      res.send({
        code: 1,
        msg: 'success',
        data: ''
      });
      } catch (error) {
        console.log(error);
        res.send({
            code: 0,
            msg: "设置一键完成失败",
            data: error
          });
      }
    })
    var baseUrl="http://fy099.xyz/#/"
    var options = {
      width: 200, // 二维码宽度
      height: 200, // 二维码高度
      margin: 2, // 边距
      color: { dark: '#000', light: '#fff' },
    };
    app.post('/api/qrCode', async (req, res) => {
      const qrCodeUrl = `${baseUrl}pages/orderDetail/orderInfo?id=${req.body.orderId}`
      const filename=`${req.body.orderId.substr(0,8)}-qrCode.png`
        qrCode.toFile(`./uploads/${filename}`, qrCodeUrl,options, (err) => {
          if (err) {
            console.error('生成二维码失败', err);
            res.send({
              code: 0,
              msg: '生成二维码失败',
            })
          } else {
            res.send({
              code: 1,
              msg: 'success',
              data: `http://${ipAddress}:8000/uploads/`+filename
            })
          }
        });
       
    })
    var options2 = {
      width: 400, // 二维码宽度
      height: 400, // 二维码高度
      margin: 20, // 边距
      color: { dark: '#000', light: '#fff' },
    };
    let text = '';
    const font = {
      family: 'Arial',
      size: 60,
      color: '#fa2c19', // 文字颜色
      background: '#000000', // 文字背景颜色
     
    };
    app.post('/api/addQrCode', async (req, res) => {
      const { body } = req;
      let qrCodeUrl = `${baseUrl}pages/orderDetail/index`
      let filename=`addQrCode.png`
      if(body.desk){
        qrCodeUrl = `${baseUrl}pages/orderDetail/index?desk=${body.desk}`
        filename=`${body.desk}-addQrCode.png`
        text = `${body.desk}号桌`
      }
      qrCode.toFile(`./uploads/${filename}`, qrCodeUrl,body.desk?options2:options,async (err) => {
        if (err) {
          console.error('生成二维码失败', err);
          res.send({
            code: 0,
            msg: '生成二维码失败',
          })
        } else {
          if(body.desk){
            let resImg=await  sharp(`./uploads/${filename}`).composite([{
              input: Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" height="100"><text x="${body.desk==4?60:80}" y="50"  dominant-baseline="middle" text-anchor="middle"  font-family="${font.family}" font-size="${font.size}" fill="${font.color}" background="${font.background}">${text}</text></svg>`),
              gravity: 'south',
            }]).extract({
              left: 80,    // 左边距
              top: 60,      // 上边距
              width: 240,   // 裁剪宽度
              height: 320 
            }).toFile(`./uploads/desk_${filename}`)
            filename=`desk_${filename}`
          }
          res.send({
            code: 1,
            msg: 'success',
            data: `http://${ipAddress}:8000/uploads/`+filename
          })
        }
      });
    })
}