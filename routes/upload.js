const router = require('koa-router')();
const path = require('path');
const fse = require('fs-extra');
const {UPLOAD_DIR, TEMP_DIR} = require('../shared/constants');
const UploadController = require('../controller/upload');

const uploadCtrl = new UploadController();
// 单文件文件上传（小文件）
router.post('/upload', async (ctx) => {
    const {
        materialType,
        folderName,
    } = ctx.request.body;
    const filePath = `${UPLOAD_DIR}/${materialType}/${folderName}`;
    let res = await uploadCtrl.uploadStatic(ctx, filePath);
    ctx.body = res;
});

// 多文件文件上传（小文件）
router.post('/upload/batch', async (ctx) => {
    const {
        materialType,
        folderName,
    } = ctx.request.body;
    const filePath = `${UPLOAD_DIR}/${materialType}/${folderName}`;
    let res = await uploadCtrl.uploadStatics(ctx, filePath);
    ctx.body = res;
});

// 单文件文件分片上传（大文件）
router.post('/upload/shard', async (ctx) => {
    const {fileHash} = ctx.request.body;
    const file = ctx.request.files.file;

    // 存放切片的临时目录
    const chunkDir = `${TEMP_DIR}/${fileHash}`;
    if (!fse.existsSync(chunkDir)) { // 没有目录就创建目录
        // 创建大文件的临时目录
        await fse.mkdirs(chunkDir);
    }
    // 原文件名.index - 每个分片的具体地址和名字
    const dPath = path.join(chunkDir, file.name);

    // 将分片文件从 temp 中移动到本次上传大文件的临时目录
    await fse.move(file.path, dPath, {
        overwrite: true,
    });
    ctx.body = '文件上传成功';
});

// 合并文件
router.post('/merge', async (ctx) => {
    const {
        name,
        materialType,
        folderName,
        fileHash,
    } = ctx.request.body;
    const fname = `${fileHash}`;

    const chunkDir = path.join(TEMP_DIR, fname);
    const chunks = await fse.readdir(chunkDir);

    // 创建当前文件存储真实位置
    const currentDir = `${UPLOAD_DIR}/${materialType}/${folderName}`;
    if (!fse.existsSync(currentDir)) {
        fse.mkdirsSync(currentDir);
    }

    chunks.sort((aa, bb) => aa - bb).map((chunkPath) => { // eslint-disable-line
        // 合并文件
        fse.appendFileSync(
            path.join(currentDir, name),
            fse.readFileSync(`${chunkDir}/${chunkPath}`)
        );
    });
    // 删除临时文件夹
    fse.removeSync(chunkDir);
    // 返回文件地址
    ctx.body = {
        msg: '合并成功',
        url: `http://localhost:3000/upload/${name}`,
    };
});

// eslint-disable-next-line
router.post('/mkdir', async (ctx) => {
    const {file_name} = ctx.request.body;
    const baseUrl = `${UPLOAD_DIR}/${file_name}/公共`;
    if (!fse.existsSync(baseUrl)) {
        fse.mkdirs(baseUrl);
    }
    ctx.body = 'success';
});

module.exports = router;
