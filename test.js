const axios = require('axios');
const http=axios.create({
    baseURL:'https://dsn3377.com/web/rest',
    headers:{
        'Content-Type':'application/json',
        'Cookie':'affCode=77741; ssid1=996024165c1c379e9542453387f86a1f; random=6987; _locale_=zh_CN; affid=seo7; token=25ea60921fd8435fdf1848c4b9769c46a8eedbb9; 438fda7746e4=25ea60921fd8435fdf1848c4b9769c46a8eedbb9'
    }
})
var money=1650
var playNum=''
var playMoney=50
 // 计算大小比例并返回结果
 function calculateSizeRatio(numbers) {
    let smallCount = 0; // 小于6的数量
    let largeCount = 0; // 大于5的数量
    
    numbers.forEach(num => {
      const numValue = parseInt(num);
      if (numValue <= 5) {
        smallCount++;
      } else if (numValue >= 6) {
        largeCount++;
      }
    });
    
    if (smallCount > largeCount) {
      return 'X'; // 小的多
    } else if (largeCount > smallCount) {
      return 'D'; // 大的多
    } else {
      return ''; // 大小相等
    }
  }
async function getHistory(){
    let res=await http.get('/member/resulthistory?lottery=SGFT&date=2025-03-11')
    // console.log(res.data.result)
    let openArr=res.data.result.map(item=>item.result.split(',')[0]).reverse()
    // console.log(openArr.slice(17-16,17-1));
    for(let i=0;i<openArr.length;i++){
        // let sizeRatio=calculateSizeRatio(openArr.slice(i,i+15))
        // console.log(sizeRatio);
        if(i>15){
           let currentNum=openArr[i]>5?'D':'X'
           console.log(`当前结果${currentNum}:${openArr[i]}`);
           if(playMoney==800){
            playMoney=25
           }
           if(playMoney>money){
            console.log('没钱了');
            console.log(playMoney);
            console.log(money);
            break
           }
           if(currentNum==playNum){
            console.log('中奖了');
            money+=parseInt(playMoney*1.999)
            playMoney=50
           }else if(playNum==''){
            // console.log('未下单');
            playMoney=50
           }
           else{
            console.log('未中奖');
            playMoney=playMoney*2
            money-=playMoney
           }    
      
           
            let sizeRatio=calculateSizeRatio(openArr.slice(i-16,i-1))
            console.log(`本期下注：${sizeRatio}`);
             if(i===openArr.length-1){
                console.log(openArr.slice(i-16,i-1));
            }
            playNum=sizeRatio
            // console.log(openArr.slice(i-16,i-1));
                 console.log('--------------------------------');
            
            
        }
    }
    console.log(money);
}
getHistory()