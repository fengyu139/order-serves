const sharp = require('sharp');
const fs = require('fs').promises;
const path = require('path');

async function fileExists(path) {
    try {
        await fs.access(path);
        return true;
    } catch {
        return false;
    }
}

async function convertToAvif() {
    try {
        // 读取 uploads 目录
        const files = await fs.readdir('uploads');
        
        // 创建输出目录（如果不存在）
        const outputDir = 'uploads';
        try {
            await fs.mkdir(outputDir, { recursive: true });
        } catch (err) {
            if (err.code !== 'EEXIST') throw err;
        }
        
        // 支持的图片格式
        const supportedFormats = ['.jpg', '.jpeg', '.png', '.webp', '.gif'];
        
        let converted = 0;
        let skipped = 0;
        
        // 遍历所有文件
        for (const file of files) {
            const ext = path.extname(file).toLowerCase();
            
            if (supportedFormats.includes(ext)) {
                const inputPath = path.join('uploads', file);
                const outputPath = path.join(outputDir, `${path.parse(file).name}.avif`);
                
                // 检查目标文件是否已存在
                if (await fileExists(outputPath)) {
                    console.log(`跳过已存在的文件: ${file}`);
                    skipped++;
                    continue;
                }
                
                console.log(`正在转换: ${file}`);
                
                // 检查图片是否包含 alpha 通道
                const metadata = await sharp(inputPath).metadata();
                const hasAlpha = metadata.hasAlpha || metadata.channels === 4;
                
                await sharp(inputPath)
                    .avif({
                        quality: 80,
                        effort: 4,
                        chromaSubsampling: '4:4:4',
                        lossless: hasAlpha
                    })
                    .toFile(outputPath);
                
                console.log(`转换完成: ${file} -> ${path.basename(outputPath)}`);
                if (hasAlpha) {
                    console.log('已保留透明度');
                }
                converted++;
            }
        }
        
        console.log('\n转换总结:');
        console.log(`- 成功转换: ${converted} 个文件`);
        console.log(`- 跳过已存在: ${skipped} 个文件`);
        console.log('所有图片处理完成！');
        
    } catch (error) {
        console.error('转换过程中发生错误:', error);
    }
}

// 运行转换
convertToAvif();
