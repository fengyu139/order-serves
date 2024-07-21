const fs = require('fs');
const path = require('path');

const desktopPath = '/Users/test/Desktop/img/temp1'; // 替换为你的桌面路径

fs.readdir(desktopPath, (err, files) => {
  if (err) {
    console.error('读取桌面文件时出错:', err);
    return;
  }

  files.forEach((file) => {
    const filePath = path.join(desktopPath, file);

    // 检查文件是否是MP3文件
    if (path.extname(filePath).toLowerCase() === '.jpg') {
      // 构造新的文件名，将后缀改为.mp4
      const newFilePath = path.join(desktopPath, `${path.basename(filePath, '.jpg')}.png`);

      // 重命名文件
      fs.rename(filePath, newFilePath, (renameErr) => {
        if (renameErr) {
          console.error(`重命名文件 ${file} 时出错:`, renameErr);
        } else {
          console.log(`文件 ${file} 的后缀已改为 .jpg`);
        }
      });
    }
  });
});