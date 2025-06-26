const axios = require('axios');
var timer=null
function getToken(token){
    let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://tp2api-cf.6y3gos.com/boracay/member/front/userInfo',
        headers: { 
          'token': token, 
        }
      };
      clearInterval(timer)
      timer=setInterval(()=>{
          axios.request(config)
      .then((response) => {
        console.log(response.data.data.memberAccount);
      })
      .catch((error) => {
        console.log(error);
      });
      },60000)
}
module.exports={
    getToken
}