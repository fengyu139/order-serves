const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ipAddress = require("./ipAddress");
const serverData=require('./serve.json')
const article = new Schema({
  title: String,
  content: String,
  createdTime: Date,
  files : Array
});
const articles = mongoose.model('articles', article);
module.exports =app=> {
app.post('/api/articleList', async (req, res) => {
    let str=req.body.searchValue
    let queryObj={}
    if(str){
        queryObj=   {
            $or: [
              { title: { $regex: str, $options: 'i' } }, // i 表示不区分大小写
              { content: { $regex: str, $options: 'i' } },
            ],
          }
    }
  let result=await articles.find(queryObj)
  result.forEach((item)=>{
      item.files&&item.files.forEach((item2,index)=>{
        item.files[index]=`http://${ipAddress}:${serverData.httpPort}/`+item2
      })
  })
  res.send({
    code: 1,
    data:result.reverse()
  })
})
app.post('/api/addArticle', async (req, res) => {
    req.body.createdTime=new Date()
  await articles.create(req.body)
  res.send({
    code: 1,
    data:''
  })
})
app.post('/api/deleteArticle', async (req, res) => {
await articles.deleteOne({_id:req.body.id})
res.send({
  code: 1,
  data:''
})
})

}