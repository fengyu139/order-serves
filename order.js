const {orderDelete,oneKeyFinish,checkOrderStatus}=require("./mongodb");
const ipAddress = require("./ipAddress");
const qrCode = require('qrcode');
// const sharp = require('sharp');
const serverData=require('./serve.json')
const textToSVG = require('text-to-svg');
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
    await oneKeyFinish(req.body);
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
    var baseUrl=serverData.h5Url
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
              data: `http://${ipAddress}:${serverData.httpPort}/uploads/`+filename
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
    // let text = '';
    // const font = {
    //   family: 'Arial',
    //   size: 60,
    //   color: '#fa2c19', // 文字颜色
    //   background: '#000000', // 文字背景颜色
     
    // };
    let text = '';
const font = {
  family: 'Arial',
  size: 30,
  color: '#fa2c19', // 文字颜色
  background: '#000000', // 文字背景颜色
};

// 创建 text-to-svg 实例
const textToSVGInstance = textToSVG.loadSync();

    app.post('/api/addQrCode', async (req, res) => {
      const { body } = req;
      let qrCodeUrl = `${baseUrl}pages/orderDetail/index?merchantID=${body.merchantID}`
      let filename=`addQrCode.png`
      if(body.desk){
        qrCodeUrl = `${baseUrl}pages/orderDetail/index?desk=${body.desk}&merchantID=${body.merchantID}`
        filename=`${body.desk}-addQrCode.png`
        text = `${body.desk}号桌`
        
      }
      // 获取 SVG 路径
const svgPath = textToSVGInstance.getSVG(text, {
  fontSize: font.size,
  anchor: 'top',
  top: 200,
  attributes: {
    fill: font.color,
    background: font.background,
  },
});
      qrCode.toFile(`./uploads/${filename}`, qrCodeUrl,body.desk?options2:options,async (err) => {
        if (err) {
          console.error('生成二维码失败', err);
          res.send({
            code: 0,
            msg: '生成二维码失败',
          })
        } else {
          // if(body.desk){
          //   let resImg=await  sharp(`./uploads/${filename}`).composite([{
          //     input: Buffer.from(svgPath),
          //     top:260,
          //     left:85
          //   }]).extract({
          //     left: 75,    // 左边距
          //     top: 70,      // 上边距
          //     width: 240,   // 裁剪宽度
          //     height: 300 
          //   }).toFile(`./uploads/desk_${filename}`)
          //   filename=`desk_${filename}`
          // }
          res.send({
            code: 1,
            msg: 'success',
            data: `http://${ipAddress}:${serverData.httpPort}/uploads/`+filename
          })
        }
      });
    })
    //订单图片
    app.post('/api/orderImg', async (req, res) => {
      const { body } = req;
      let oNum=body.takeMeal
      const svgPath = textToSVGInstance.getSVG(`${oNum}号`, {
        fontSize: 60,
        anchor: 'top',
        attributes: {
          fill: font.color,
          background: font.background,
        },
      });
      // let resImg=await  sharp(`./uploads/orderNum.jpg`).composite([{
      //   input: Buffer.from(svgPath),
      //   top:230,
      //   left:220
      // }]).toFile(`./uploads/orderNum_${oNum}.jpg`)
      // res.send({
      //   code: 1,
      //   msg: 'success',
      //   data: `http://${ipAddress}:${serverData.httpPort}/uploads/orderNum_${oNum}.jpg`
      // })
    })
    // 检查订单状态
    app.post('/api/checkOrderStatus', async (req, res) => {
      let result=await checkOrderStatus(req.body.id)
      res.send({
        code: 1,
        msg: 'success',
        data: result.length>0
      })
    })
    
   async function testImg(){
     
    }
    // testImg()
}