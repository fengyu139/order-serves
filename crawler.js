const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const request = require('request');

// 目标网站的 URL
const websiteURL = 'https://xiaobaotv.net/index.php';

// 发送 HTTP 请求，获取网页内容
async function fetchWebsiteContent() {
  try {
    const response = await axios.get(websiteURL);
    console.log(response.data);
    return response.data;
  } catch (error) {
    // console.error('Error fetching website content:', error);
    throw error;
  }
}

// 解析 HTML 页面并提取图片和视频链接
async function parseWebsiteContent(html) {
  const $ = cheerio.load(html);
  const mediaLinks = [];

  // 提取图片链接
  $('img').each((index, element) => {
    const imgSrc = $(element).attr('src');
    if (imgSrc) {
      mediaLinks.push(imgSrc);
      console.log(imgSrc);
    }
  });

  // 提取视频链接
  $('video source').each((index, element) => {
    const videoSrc = $(element).attr('src');
    if (videoSrc) {
      mediaLinks.push(videoSrc);
    }
  });

  return mediaLinks;
}

// 下载媒体文件
async function downloadMediaFiles(mediaLinks) {
  for (const link of mediaLinks) {
    const mediaName = path.basename(link);
    console.log(mediaName);
    const mediaPath = path.join(__dirname, './downloads/'+mediaName);

    request(link).pipe(fs.createWriteStream(mediaPath));

    // console.log(`Downloaded: ${mediaName}`);
  }
}

// 主函数
async function main() {
  const html = await fetchWebsiteContent(websiteURL);
  const mediaLinks = await parseWebsiteContent(html);
  await downloadMediaFiles(mediaLinks);
}

main();
