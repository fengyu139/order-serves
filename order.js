const {orderDelete,oneKeyFinish}=require("./mongodb");
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
}