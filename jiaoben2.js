const schedule =require('node-schedule')
const request =require('request')
const config= require('./juejinConfig') 
schedule.scheduleJob('0 30 0 * * *', () => {
    request(config.check_url, {
        method: 'post',
        headers: {
            Referer: config.url,
            Cookie: config.cookie
        },
    }, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            console.log(body)
        }
    })
})