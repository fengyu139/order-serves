const {orderDelete,oneKeyFinish}=require("./mongodb");
const ipAddress = require("./ipAddress");
const qrCode = require('qrcode');
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
    app.post('/api/addQrCode', async (req, res) => {
      const { body } = req;
      let qrCodeUrl = `${baseUrl}pages/orderDetail/index`
      let filename=`addQrCode.png`
      if(body.desk){
        qrCodeUrl = `${baseUrl}pages/orderDetail/index?desk=${body.desk}`
        filename=`${body.desk}-addQrCode.png`
      }
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
}