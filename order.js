const {orderDelete}=require("./mongodb");
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
}