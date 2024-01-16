const cron = require('node-cron');
const notifier = require('node-notifier');
const { exec } = require('child_process');
const Tesseract = require('tesseract.js');
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

const sharp = require('sharp');

const imagePath = './uploads/domain (1).png';


// sharp(imagePath)
//   .metadata()
//   .then(metadata => {
//     const width = metadata.width;
//     const height = metadata.height;
//     console.log('图片宽度:', width);
//     console.log('图片高度:', height);
//   })
//   .catch(error => {
//     console.error('获取图片宽高失败:', error);
//   });
// getImageInfo()
var a = {
    num: 0,
    valueOf:function(){
        return this.num++
    }
}
console.log(a);
console.log(a);
console.log(a);