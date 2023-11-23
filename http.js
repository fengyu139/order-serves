//http.js
const { v4: uuidv4 } = require('uuid');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors'); // 导入 cors 中间件
const express = require("express");
const bodyParser = require('body-parser');
const multer = require('multer');
const dayjs = require('dayjs');
const {orderSave,findOrder,updateOrder,findChart,findChartPie,orderTotal}=require("./mongodb");
const {menuSave,findMenus,updateMenu,deleteMenu}=require("./allMenu");
const {recordsSave,findRecords,updateRecords}=require("./orderRecords");
const logger = require('./log4jsLogger');
function createLogProxy (logLevel, logger) {
  return (...param) => {
      logger[logLevel](...param);
  };
}
console.log = createLogProxy('debug', logger);
console.info = createLogProxy('info', logger);
console.warn = createLogProxy('warn', logger);
console.error = createLogProxy('error', logger);
//服务端口 
const port = "8000";
const app = express();
app.use(bodyParser.json({ limit: '200mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '200mb' }));
app.use(cors());
const server = http.createServer(app);
const io = socketIo(server ,  {
  cors: {
    origin: '*'
}
});
server.listen(9000, () => {
  // console.log(`server is running at http://127.0.0.1:9000`);
})
app.use(express.json());
require('./db')(app)
require('./login')(app)
require('./lottery')(app)
require('./chat')(io,app)
//获取图表数据
app.post("/api/chartBar", async (req, res) => {
  console.log(req.userName);
  let result1=await findChart(req.body)
  let barData={
    times:[],
    values:[]
  }
  result1.forEach((item)=>{
    console.log(item.data);
    barData.times.unshift(item._id.month+"-"+item._id.day)
    barData.values.unshift(item.data.toFixed(2)+0)
  })
  let result2=await findChartPie(req.body)
  let pieData={}
  result2.forEach((item)=>{
    item.orderDetail.forEach((item)=>{
      pieData[item.name]= (pieData[item.name]||0) +Number(item.count)
    })
  })
  const keysArray = [];
  for (const key in pieData) {
    if (pieData.hasOwnProperty(key)) {
      pieData[key]>0&&keysArray.push({ name: key, value: pieData[key] });
    }
  }
  let sendData={
    bar:barData,
    pie:keysArray
  }
  res.send({
    code: 1,
    msg: "success",
    data: sendData
  });
})
//获取加菜纪录
app.post("/api/recordsList", (req, res) => {
  findRecords(req.body).then((result) => {
    res.send({
      code: 1,
      msg: "success",
      data: result
    });
  });
});
app.post("/api/updateOneRecord", (req, res) => {
  req.body.isItem=true
  updateRecords(req.body).then((result) => {
    res.send({
      code: 1,
      msg: "success",
      data: result
    });
  });
})
//设置加菜纪录
app.post("/api/updateRecord", (req, res) => {
  updateRecords(req.body).then((result) => {
    res.send({
      code: 1,
      msg: "success",
      data: result
    });
  });
});
//查询列表
app.post("/api/orderList", (req, res) => {
  //获取monbodb数据
  findOrder(req.body).then(async (result) => {
    for (const item of result) {
      let createdTime = dayjs(item.createdTime).format(
              "YYYY-MM-DD HH:mm:ss"
            );
           let  records=await findRecords({orderId:item.id,isFinish:false})
            item.undoneRecord=records.length>0
            item.showTime=createdTime
            item.actualMoney=item.actualMoney||item.totalMoney
    }
    if(req.body.id||req.body.desk){
      res.send({
        code: 1,
        msg: "success",
        data: result
      });
      return
    }
    let resData=result.map((item)=>{
      item.orderDetail={}
         return item
     })
    res.send({
      code: 1,
      msg: "success",
      data: resData.reverse()
    });
  });
});
//加菜接口
app.post("/api/addFoods",async (req, res) => {
  const { body } = req;
  let res1=await findOrder({id:body.orderId});
  if(res1[0].isFinish){
    res.send(
      {
        code: 0,
        msg: "订单已结束,请重新扫码下单！",
        data: ''
      }
    )
    return
  }
  let newData=JSON.parse(JSON.stringify(res1[0]))
   body.items.forEach((item)=>{
    if(item.count){
      let index = newData.orderDetail.findIndex((food)=>{
        return food.id==item.id
      })
      try {
        if(index>-1){
          newData.orderDetail[index].count=Number(newData.orderDetail[index].count)+Number(item.count)
        }else{
          newData.orderDetail.push(item)
        }
        
      } catch (error) {
        res.send(
          {
            code: 0,
            msg: "出错了请刷新页面重试",
            data: ''
          }
        )
      }
    }
  })
  newData.totalMoney=newData.orderDetail.reduce((total,item)=>{
    return total+item.price*Number(item.count)
  },0)
  newData.totalCount=newData.orderDetail.reduce((total,item)=>{
    return total+Number(item.count)
  },0)
  console.log(newData);
  await updateOrder(newData)
  body.isFinish=false
  await recordsSave(body)
  res.send(
    {
      code: 1,
      msg: "success",
      data: true
    }
  )
})
//新增订单
app.post("/api/addOrder",async (req, res) => {
  const { body } = req;
  body.id = uuidv4();
  body.orderDetail&&body.orderDetail.forEach((item)=>{
    item.count=Number(item.count)
  })
  let orderFlag=0
  if(!body.desk&&body.userOperation){
    let count=await orderTotal()
    orderFlag=count+1
    body.orderName=body.orderName.split('-')[0]+"-"+(count+1)+"号订单"
  }
  if(body.desk){
    let deskResult =await findOrder({desk:body.desk,isFinish:false})
    if(deskResult.length>0){
      res.send(
        {
          code: 0,
          msg: "桌号已被占用,请先去设置已完成！",
          data: ''
        }
      )
      return
    }
  }
  orderSave(body).then((result) => {
    res.send(
      {
        code: 1,
        msg: "success",
        data: body.id,
        orderFlag:orderFlag
      }
    )
    if(body.userOperation){
      let data={
        id:uuidv4(),
        orderId:body.id,
        desk:body.desk,
        items:body.orderDetail.filter((item) => item.count > 0),
        totalMoney:body.totalMoney,
        totalCount:body.totalCount,
        createTime:dayjs().format('YYYY-MM-DD HH:mm:ss'),
        isFinish:true
      }
      recordsSave(data)
    }
  }).catch((err)=>{
    res.send(
      {
        code: 0,
        msg: "error",
        data: err
      }
    )
  })
  recordsSave
});
// 更新订单
app.post("/api/updateOrder", async(req, res) => {
  const { body } = req;
  body.orderDetail&&body.orderDetail.forEach((item)=>{
    item.count=Number(item.count)
  })
  updateOrder(body).then(async (result) => {
    if(body.isFinish){
      updateRecords(body)
    }
    if(body.isAdmin){
      try {
        let rData= await findRecords({orderId:body.id})
      let data={
        id:uuidv4(),
        orderId:body.id,
        desk:body.desk,
        items:body.recordsList.filter((item) => item.count > 0),
        totalMoney:body.recordsList.reduce((total,item)=>{
          return total+item.price*Number(item.count)
        },0),
        totalCount:body.recordsList.reduce((total,item)=>{
          return total+Number(item.count)
        },0),
        createTime:dayjs().format('YYYY-MM-DD HH:mm:ss'),
        isFinish:rData.length<1
      }
      recordsSave(data)
      }
      catch (error) {
        logger.error(error)
      }
     
    }
    res.send(
      {
        code: 1,
        msg: "success",
        data: true
      }
    )
  }).catch((err)=>{
    res.send(
      {
        code: 0,
        msg: "error",
        data: err
      }
    )
  })
})
// app.post("/api/addOrder", (req, res) => {
//   const { body } = req;
//   orderSave(body).then((result) => {
//     res.send(JSON.stringify(result));
//   })
// });
//添加菜单
app.post("/api/addMenu", (req, res) => {
  const { body } = req;
  menuSave(body).then((result) => {
    res.send({
      code: 1,
      msg: "success",
      data: true
    });
  }).catch((err)=>{
    logger.error(err)
    res.send({
      code: 0,
      msg: err,
      data: ''
    });
  })
});
//修改菜单
app.post("/api/updateMenu", (req, res) => {
  const { body } = req;
  updateMenu(body).then(() => {
    res.send({
      code: 1,
      msg: "success",
      data: true
    });
  }).catch((err)=>{
    logger.error(err)
    res.send({
      code: 0,
      msg: err,
      data: ''
    });
  })
});
//删除菜单
app.post("/api/deleteMenu", (req, res) => {
  const { body } = req;
  if(body.id){
    deleteMenu(body.id).then(() => {
      res.send({
        code: 1,
        msg: "success",
        data: true
      });
    }).catch((err)=>{
      res.send({
        code: 0,
        msg: err,
        data: ''
      });
    })
  }else{
    res.send({
      code: 0,
      msg: "id是必须传的！",
      data: ''
    });
  }
})

// 获取和查询菜单
app.post("/api/getMenu",  (req, res) => {
  findMenus(req.body).then((result) => {
    const serverAddress = `${req.protocol}://${req.get('host')}/`;
    let url='';
    serverAddress.includes('127.0.0.1')?url='http://127.0.0.1:8000/':url='http://154.92.15.136:8000/';
    result.forEach((item)=>{
      item.picImg=url+item.picImg
    })
    console.log(serverAddress);
    res.send({
      code: 1,
      msg: "success",
      data: result
    })
  }).catch((err)=>{
    res.send({
      code: 0,
      msg: err,
      data: ''
    });
  })
})

// 配置文件上传目录和文件名
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // 上传的文件将保存在 uploads/ 文件夹
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname); // 文件名会添加时间戳，以避免重名
  },
});
const upload = multer({ storage, limits: {
  fileSize: 1024 * 1024 * 200, // 限制文件大小为 5MB，根据需求调整
}, });
app.post('/api/upload', upload.single('image'), (req, res) => {
  // 文件已上传成功
  res.send({
    code: 1,
    msg: "success",
    data: 'uploads/' + req.file.filename
  });
});

app.use('/uploads', express.static('uploads'));
app.listen(port,  () => {
  // logger.info(`Server running on port ${port}`);
});

