const axios=require('axios')
const cheerio = require('cheerio');
const fs = require('fs');
//监听test
// cron.schedule('* * * * *', () => {
//   // 每天上午9点执行
//   console.log('定时任务执行了');
// //   notifier.notify({
// //     title: 'Reminder',
// //     message: 'Don\'t forget your morning meeting!'
// //   });
// });

//脚本打开软件
// exec('open https://www.example.com');
// // 打开默认关联的文本编辑器
// exec('open /Users/test/Desktop/开发账号.txt');
// exec('open -a "Postman"');
//打开多个窗口
// exec('open -na "Google Chrome"');
// exec('open -na "Google Chrome"');
// 打开 Visual Studio Code
// exec('open -a "Visual Studio Code"');

//图片识别


// 图片路径
// const imagePath = '/Users/test/Desktop/截图/u=1313425049,3642196824&fm=253&fmt=auto&app=138&f=JPEG.webp';
// // 进行图片文字识别
// Tesseract.recognize(
//   imagePath,
//   'chi_sim', // 语言代码，这里使用英语
//   { logger: info => console.log(info) } // 传入 logger 对象，用于输出调试信息
// ).then(({ data: { text } }) => {
//   console.log('识别结果:', text.replace(/\s/g, ''));
// }).catch(error => {
//   console.error('识别错误:', error);
// });

// const sharp = require('sharp');

// const imagePath = './uploads/domain (1).png';


// // sharp(imagePath)
// //   .metadata()
// //   .then(metadata => {
// //     const width = metadata.width;
// //     const height = metadata.height;
// //     console.log('图片宽度:', width);
// //     console.log('图片高度:', height);
// //   })
// //   .catch(error => {
// //     console.error('获取图片宽高失败:', error);
// //   });
// // getImageInfo()
// var a = {
//     num: 0,
//     valueOf:function(){
//         return this.num++
//     }
// }
// console.log(a);
// console.log(a);
// console.log(a);

// "workbench.colorCustomizations": {
//   "statusBar.background": "#000",
//   "statusBar.foreground": "#fff",
//   "statusBar.noFolderBackground": "#007acc",  
//   "statusBar.noFolderForeground": "#ffffff",
//   "statusBar.debuggingBackground": "#cc3700",
//   "statusBar.debuggingForeground": "#ffffff",
// },
const textToRemove = '请收藏本站：https://www.bg60.cc。笔趣阁手机版：https://m.bg60.cc『点此报错』『加入书签';
// https://www.bg60.cc/book/9289/ 北派盗墓笔记  777页
async function getText() {
    let num=600
    let text=''
       function sendAxios() {
        if(num<1200){
            axios.get(`https://www.bg60.cc/book/9289/${num}.html`).then((res)=>{
            const $ = cheerio.load(res.data);
            // 根据div的class或者id选择器来获取内容
            let str=$('.content .wap_none').text()
            let str2=str.slice(0, str.indexOf('新书推荐'))
            console.log(str2);
            const divContent =str2+"--"+$('#chaptercontent').text();
        
            // 打印内容
            // console.log(typeof divContent);
            let current=divContent.replace(/\r?\n|\r|\s/g, '').replace(new RegExp(textToRemove, 'g'), '')
            text=text+current
            num++
            sendAxios()
        }).catch((err)=>{
            console.log(err);
            fs.writeFile('processed_example.txt', text, 'utf8', (err) => {
                if (err) {
                  console.error('文件写入失败:', err);
                  return;
                }
                console.log(`失败后的内容已写入新文件当前章数-${num} processed_example.txt`);
              });
        })
        }else{
            fs.writeFile('processed_example.txt', text, 'utf8', (err) => {
                if (err) {
                  console.error('文件写入失败:', err);
                  return;
                }
                console.log('处理后的内容已写入新文件 processed_example.txt');
              });
        }
       }
       sendAxios()
}
getText()