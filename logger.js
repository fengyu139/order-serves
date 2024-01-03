function logger(req, res, next) {
    const time = new Date();
    if(!req.url.includes('/uploads')){
        console.log(`[${time.toLocaleString()}] ------${req.method} ----- ${req.url}-----${req.headers['user-agent']}---${req.ip}---body:${JSON.stringify(req.body)}---query:${JSON.stringify(req.query)}`);
    }
    next();
  }
  
  module.exports = logger;