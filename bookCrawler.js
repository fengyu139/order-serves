const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs').promises;

async function sleep(min, max) {
    const time = Math.floor(Math.random() * (max - min + 1)) + min;
    return new Promise(resolve => setTimeout(resolve, time));
}

// 随机User-Agent列表
const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 Edg/91.0.864.59',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Mobile/15E148 Safari/604.1'
];

// 代理列表
const proxyList = [
    'http://127.0.0.1:7890',  // 如果你使用Clash，这是默认端口
    'http://127.0.0.1:1087',  // 其他常用代理端口
    'http://127.0.0.1:1080'
];

async function crawlChapter() {
    try {
        let text = '';
        let num = 72837;
        const endNum = 72863;
        let retryCount = 0;
        const maxRetries = 5;  // 增加重试次数

        while (num < endNum) {
            try {
                console.log(`正在抓取第${num}章...`);
                
                // 随机选择User-Agent和代理
                const userAgent = userAgents[Math.floor(Math.random() * userAgents.length)];
                const proxy = proxyList[Math.floor(Math.random() * proxyList.length)];
                
                const headers = {
                    'User-Agent': userAgent,
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                    'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
                    'Accept-Encoding': 'gzip, deflate, br',
                    'Referer': 'https://www.99csw.com/book/2425/index.htm',
                    'Connection': 'keep-alive',
                    'Cache-Control': 'max-age=0',
                    'Host': 'www.99csw.com',
                    'Upgrade-Insecure-Requests': '1',
                    'Sec-Fetch-Dest': 'document',
                    'Sec-Fetch-Mode': 'navigate',
                    'Sec-Fetch-Site': 'same-origin',
                    'Sec-Fetch-User': '?1',
                    'Cookie': 'visited=yes'  // 添加基本Cookie
                };

                const response = await axios.get(`https://www.99csw.com/book/2425/${num}.htm`, {
                    headers,
                    proxy: {
                        protocol: 'http',
                        host: proxy.split('://')[1].split(':')[0],
                        port: proxy.split(':')[2]
                    },
                    timeout: 30000,
                    maxRedirects: 5,
                    validateStatus: function (status) {
                        return status >= 200 && status < 400;
                    }
                });

                const $ = cheerio.load(response.data);
                const content = $('#content').text();

                if (!content) {
                    throw new Error('内容为空，可能是被反爬或页面结构改变');
                }

                // 处理内容
                const processedContent = content
                    .replace(/\r?\n|\r|\s/g, '')
                    .replace(/请收藏本站：.*?『加入书签』/g, '');

                text += `第${num}章\n${processedContent}\n\n`;

                // 保存进度
                await fs.writeFile('book.txt', text, 'utf8');
                console.log(`第${num}章保存成功`);

                retryCount = 0;
                
                // 增加随机延时5-10秒
                await sleep(5000, 10000);
                num++;

            } catch (error) {
                console.error(`抓取第${num}章时出错:`, error.message);
                
                retryCount++;
                if (retryCount <= maxRetries) {
                    const waitTime = retryCount * 30000; // 递增等待时间
                    console.log(`第${retryCount}次重试，等待${waitTime/1000}秒...`);
                    await sleep(waitTime, waitTime + 5000);
                    continue;
                } else {
                    console.log(`已达到最大重试次数(${maxRetries})，保存当前进度并退出`);
                    await fs.writeFile('book.txt', text, 'utf8');
                    process.exit(1);
                }
            }
        }

        console.log('全部章节抓取完成！');

    } catch (error) {
        console.error('发生错误:', error);
    }
}

// 运行爬虫
crawlChapter(); 