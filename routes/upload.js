const router = require('koa-router')()
const fs = require('fs');
const path = require('path');
const fse = require('fs-extra');
const { UPLOAD_DIR, TEMP_DIR } = require('../shared/constants');

// 上传单个文件
const uploadStatic = async (obj) => {
    const file = obj.files.file
    // 创建可读流
    const reader = fse.createReadStream(file.path);
    let filePath = UPLOAD_DIR + `/${file.name}`;
    // 创建可写流
    const upStream = fse.createWriteStream(filePath);
    // 可读流通过管道写入可写流
    reader.pipe(upStream);
    return "上传成功！";
}

// 单文件文件上传（小文件）
router.post('/upload', async ctx => {
    // const files = ctx.request.files
    // console.log('ctx.request.body: ', ctx.request.body)
    let res = await uploadStatic(ctx.request);
    ctx.body = res;
})

// 上传多个文件
const uploadStatics = async (obj) => {
    const files = obj.files.file
    for (let file of files) {
        // 创建可读流
        const reader = fse.createReadStream(file.path);
        let filePath = UPLOAD_DIR + `/${file.name}`;
        // 创建可写流
        const upStream = fse.createWriteStream(filePath);
        // 可读流通过管道写入可写流
        reader.pipe(upStream);
    }
    return "上传成功！";
}

// 多文件文件上传（小文件）
router.post('/upload-duo', async ctx => {
    // const files = ctx.request.files
    // console.log('files: ', files.file);
    let res = await uploadStatics(ctx.request);
    ctx.body = res;
})


// 单文件文件分片上传（大文件）
router.post('/fen-upload', async ctx => {
    const {
        uid,
        materialType,
        folderName,
        fileHash,
    } = ctx.request.body
    const file = ctx.request.files.file

    // 存放切片的临时目录
    const chunkDir = `${TEMP_DIR}/${fileHash}`;
    if (!fse.existsSync(chunkDir)) { // 没有目录就创建目录
        // 创建大文件的临时目录
        await fse.mkdirs(chunkDir)
    }
    // 原文件名.index - 每个分片的具体地址和名字
    const dPath = path.join(chunkDir, file.name)

    // 将分片文件从 temp 中移动到本次上传大文件的临时目录
    await fse.move(file.path, dPath, {
        overwrite: true
    })
    ctx.body = '文件上传成功'
})

// 合并文件
router.post('/merge', async ctx => {
    const {
        name,
        uid,
        materialType,
        folderName,
        fileHash,
    } = ctx.request.body
    const fname = `${fileHash}`;

    const chunkDir = path.join(TEMP_DIR, fname)
    const chunks = await fse.readdir(chunkDir)

    // 创建当前文件存储真实位置
    const currentDir = `${UPLOAD_DIR}/${materialType}/${folderName}`;
    if (!fse.existsSync(currentDir)) {
        fse.mkdirsSync(currentDir);
    }

    chunks.sort((a, b) => a - b).map(chunkPath => {
        // 合并文件
        fse.appendFileSync(
            path.join(currentDir, name),
            fse.readFileSync(`${chunkDir}/${chunkPath}`)
        )
    })
    // 删除临时文件夹
    // fse.removeSync(chunkDir)
    // 返回文件地址
    ctx.body = {
        msg: '合并成功',
        url: `http://localhost:3000/upload/${name}`
    }
})

router.post('/mkdir', async ctx => {
    const { file_name } = ctx.request.body;
    const baseUrl = `${UPLOAD_DIR}/${file_name}/公共`;
    if (!fse.existsSync(baseUrl)) {
        fse.mkdirs(baseUrl);
        console.log('file_name: ', file_name);
    }
    ctx.body = 'success';
})

module.exports = router;