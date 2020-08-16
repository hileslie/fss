const fse = require('fs-extra');
class Upload {
    // 单文件流读写
    handleStream(file, filePath) {
        filePath = `${filePath}/${file.name}`;
        // 创建可读流
        const reader = fse.createReadStream(file.path);
        // 创建可写流
        const upStream = fse.createWriteStream(filePath);
        // 可读流通过管道写入可写流
        reader.pipe(upStream);
    }

    // 目录判断没有则创建
    async existsSync(dir) {
        if (!fse.existsSync(dir)) { // 没有目录就创建目录
            // 创建目录
            await fse.mkdirs(dir)
        }
    }

    // 小单文件处理
    async uploadStatic(ctx, filePath) {
        const file = ctx.request.files.file;
        await this.existsSync(filePath);
        this.handleStream(file, filePath);
        return "上传成功！";
    }

    // 小多文件处理
    async uploadStatics(ctx, filePath) {
        const files = ctx.request.files.file;
        await this.existsSync(filePath);
        for (let file of files) {
            this.handleStream(file, filePath);
        }
        return "上传成功！";
    }
}

module.exports = Upload;