const axios = require('axios');
const message = process.argv[2];
// 检查是否提供了消息内容
// if (!message) {
//   console.error('Please provide a message as a command line argument.');
//   process.exit(1);
// }
axios.post("http://127.0.0.1:8000/api/chatSend", {
    msg: message,
}).then(res => {
    console.log(res.data.data)
}).catch(err => {
    console.log(err)
})
