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
    app.post('/api/qrCode', async (req, res) => {
      const options = {
        margin: 2, // 边距
        color: { dark: '#007aff', light: '#fff' },
      };
      const qrCodeUrl = `http://154.92.15.136:5172/#/pages/orderDetail/orderInfo?id=${req.body.orderId}`
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
}