const xml2js = require('xml2js');
module.exports = app => {
  app.post('/api/payNotify', (req, res) => {
    let xmlData = '';
  req.on('data', chunk => {
    xmlData += chunk;
  });

  req.on('end', () => {
    // 解析XML数据
    xml2js.parseString(xmlData, (err, result) => {
      if (err) {
        console.error(err);
        return;
      }

      // 处理支付结果
      const { return_code, result_code } = result.xml;
      if (return_code === 'SUCCESS' && result_code === 'SUCCESS') {
        // 支付成功，进行相应处理
        // ...
      } else {
        // 支付失败，进行相应处理
        // ...
      }
    });
  });
  res.send('<xml><return_code><![CDATA[SUCCESS]]></return_code><return_msg><![CDATA[OK]]></return_msg></xml>');
  })
 }